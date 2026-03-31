"""
CODECASH Competitor Review Extraction Pipeline
Scrapes Play Store reviews for M-Pesa/Deriv competitor apps
and exports structured data for analysis.
"""

import os
import json
import csv
from datetime import datetime
from google_play_scraper import reviews_all, Sort

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Target competitor apps (M-Pesa & Deriv ecosystem in Kenya)
COMPETITOR_APPS = {
    "com.safaricom.mpesa": "M-Pesa (Safaricom)",
    "com.deriv.app": "Deriv - Online Trading",
    "com.binary.ticktrade": "Deriv GO",
    "com.deriv.dp2p": "Deriv P2P",
    "com.king.debit": "DLocal (Payment Gateway)",
}

def classify_sentiment(score):
    """Classify review sentiment based on star rating."""
    if score >= 4:
        return "Positive"
    elif score <= 2:
        return "Negative"
    return "Neutral"

def extract_reviews():
    """Extract reviews from all competitor apps."""
    all_reviews = []
    
    for package_id, app_name in COMPETITOR_APPS.items():
        print(f"\n{'='*60}")
        print(f"Scraping: {app_name} ({package_id})")
        print(f"{'='*60}")
        
        try:
            result = reviews_all(
                package_id,
                sleep_milliseconds=500,
                lang='en',
                country='ke',
                sort=Sort.NEWEST,
            )
            
            print(f"  ✓ Fetched {len(result)} reviews")
            
            for review in result:
                all_reviews.append({
                    "app_package": package_id,
                    "app_name": app_name,
                    "review_id": review.get("reviewId", ""),
                    "username": review.get("userName", "Anonymous"),
                    "score": review.get("score", 0),
                    "content": review.get("content", ""),
                    "thumbs_up": review.get("thumbsUpCount", 0),
                    "reply_content": review.get("replyContent", ""),
                    "reviewed_at": review.get("at", datetime.now()).isoformat() if review.get("at") else "",
                    "type": classify_sentiment(review.get("score", 3)),
                })
                
        except Exception as e:
            print(f"  ✗ Error scraping {app_name}: {e}")
            # Continue with other apps even if one fails
            continue
    
    return all_reviews

def export_data(reviews):
    """Export reviews to CSV and JSON formats."""
    if not reviews:
        print("\n⚠ No reviews collected. Check app package IDs or network connectivity.")
        return
    
    # Export JSON
    json_path = os.path.join(OUTPUT_DIR, "competitor_analysis.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(reviews, f, indent=2, ensure_ascii=False, default=str)
    print(f"\n✓ JSON exported: {json_path} ({len(reviews)} reviews)")
    
    # Export CSV
    csv_path = os.path.join(OUTPUT_DIR, "competitor_analysis.csv")
    if reviews:
        fieldnames = reviews[0].keys()
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(reviews)
        print(f"✓ CSV exported: {csv_path}")
    
    # Print summary
    print(f"\n{'='*60}")
    print("EXTRACTION SUMMARY")
    print(f"{'='*60}")
    print(f"Total reviews collected: {len(reviews)}")
    
    # Per-app breakdown
    app_counts = {}
    for r in reviews:
        app_name = r["app_name"]
        app_counts[app_name] = app_counts.get(app_name, 0) + 1
    
    for app, count in app_counts.items():
        print(f"  • {app}: {count} reviews")
    
    # Sentiment breakdown
    sentiment_counts = {"Positive": 0, "Negative": 0, "Neutral": 0}
    for r in reviews:
        sentiment_counts[r["type"]] = sentiment_counts.get(r["type"], 0) + 1
    
    print(f"\nSentiment Distribution:")
    for sentiment, count in sentiment_counts.items():
        pct = (count / len(reviews)) * 100 if reviews else 0
        print(f"  {sentiment}: {count} ({pct:.1f}%)")

if __name__ == "__main__":
    print("╔══════════════════════════════════════════════════╗")
    print("║     CODECASH Competitor Review Extractor         ║")
    print("║     Targeting M-Pesa & Deriv Ecosystem           ║")
    print("╚══════════════════════════════════════════════════╝")
    print(f"\nStarted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    reviews = extract_reviews()
    export_data(reviews)
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
