"""
CODECASH Competitor Intelligence Report Generator
Analyzes scraped Play Store reviews to identify pain points
and generate actionable insights for the CODECASH roadmap.
"""

import os
import json
from datetime import datetime
from collections import Counter

# Paths
SCRIPT_DIR = os.path.dirname(__file__)
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "output")
INPUT_FILE = os.path.join(OUTPUT_DIR, "competitor_analysis.json")
REPORT_FILE = os.path.join(OUTPUT_DIR, "pain_point_report.json")

# Pain point categories with keyword tagging
PAIN_POINT_CATEGORIES = {
    "Transaction Speed": {
        "keywords": [
            "delay", "delayed", "pending", "hours", "stuck", "slow", "waiting",
            "takes long", "too long", "never received", "not received", "late",
            "taking forever", "still waiting", "processing", "time", "days"
        ],
        "description": "Issues related to transaction delays, pending payments, and slow processing",
        "codecash_solution": "Real-time transaction status tracker with multi-stage visibility"
    },
    "Financial Integrity": {
        "keywords": [
            "rate", "rates", "expensive", "fees", "fee", "stolen", "scam",
            "hidden", "charge", "charged", "overcharge", "money gone",
            "exchange rate", "commission", "unfair", "ripoff", "rip off",
            "deducted", "lost money", "wrong amount", "missing money"
        ],
        "description": "Complaints about exchange rates, hidden fees, and financial discrepancies",
        "codecash_solution": "Transparent exchange calculator with zero hidden fees badge"
    },
    "Support / Communication": {
        "keywords": [
            "ignore", "ignored", "offline", "customer care", "unresponsive",
            "no response", "support", "help", "contact", "complaint",
            "no reply", "never respond", "useless support", "terrible service",
            "nobody answers", "email", "call", "agent", "helpline"
        ],
        "description": "Poor customer service, unresponsive support teams",
        "codecash_solution": "Proactive delay notification system with automated user communication"
    },
    "Technical Stability": {
        "keywords": [
            "crash", "crashes", "login", "bug", "bugs", "won't open",
            "not working", "error", "broken", "glitch", "freeze",
            "freezes", "blank screen", "force close", "update", "loading",
            "can't access", "down", "server", "maintenance", "unstable"
        ],
        "description": "App crashes, login failures, and general technical issues",
        "codecash_solution": "PWA with offline caching and service worker for crash resilience"
    }
}

def load_reviews():
    """Load scraped reviews from JSON file."""
    if not os.path.exists(INPUT_FILE):
        print(f"✗ Input file not found: {INPUT_FILE}")
        print("  Run extract_reviews.py first to generate data.")
        return []
    
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        reviews = json.load(f)
    
    print(f"✓ Loaded {len(reviews)} reviews from {INPUT_FILE}")
    return reviews

def categorize_review(content):
    """Tag a review with matching pain point categories."""
    content_lower = content.lower()
    matched_categories = []
    
    for category, config in PAIN_POINT_CATEGORIES.items():
        for keyword in config["keywords"]:
            if keyword in content_lower:
                matched_categories.append(category)
                break  # One match per category is enough
    
    return matched_categories

def analyze_reviews(reviews):
    """Perform full analysis on negative reviews."""
    # Filter negative reviews
    negative_reviews = [r for r in reviews if r.get("type") == "Negative"]
    print(f"\n📊 Analyzing {len(negative_reviews)} negative reviews (out of {len(reviews)} total)")
    
    # Initialize results
    category_data = {}
    for category in PAIN_POINT_CATEGORIES:
        category_data[category] = {
            "count": 0,
            "percentage": 0.0,
            "top_examples": [],
            "by_app": Counter(),
            "description": PAIN_POINT_CATEGORIES[category]["description"],
            "codecash_solution": PAIN_POINT_CATEGORIES[category]["codecash_solution"]
        }
    
    uncategorized_count = 0
    
    for review in negative_reviews:
        content = review.get("content", "")
        if not content:
            continue
        
        categories = categorize_review(content)
        
        if not categories:
            uncategorized_count += 1
            continue
        
        for category in categories:
            cat = category_data[category]
            cat["count"] += 1
            cat["by_app"][review.get("app_name", "Unknown")] += 1
            
            # Keep top 5 examples (sorted by thumbs_up for relevance)
            if len(cat["top_examples"]) < 5:
                cat["top_examples"].append({
                    "app": review.get("app_name", "Unknown"),
                    "score": review.get("score", 0),
                    "content": content[:300],  # Truncate long reviews
                    "thumbs_up": review.get("thumbs_up", 0),
                    "date": review.get("reviewed_at", "")
                })
            elif review.get("thumbs_up", 0) > min(e.get("thumbs_up", 0) for e in cat["top_examples"]):
                # Replace the least-voted example
                cat["top_examples"].sort(key=lambda x: x.get("thumbs_up", 0))
                cat["top_examples"][0] = {
                    "app": review.get("app_name", "Unknown"),
                    "score": review.get("score", 0),
                    "content": content[:300],
                    "thumbs_up": review.get("thumbs_up", 0),
                    "date": review.get("reviewed_at", "")
                }
    
    # Calculate percentages
    total_categorized = sum(cat["count"] for cat in category_data.values())
    for category in category_data:
        cat = category_data[category]
        cat["percentage"] = round((cat["count"] / total_categorized * 100), 1) if total_categorized > 0 else 0
        cat["by_app"] = dict(cat["by_app"])  # Convert Counter to dict for JSON
        # Sort examples by thumbs_up
        cat["top_examples"].sort(key=lambda x: x.get("thumbs_up", 0), reverse=True)
    
    return {
        "generated_at": datetime.now().isoformat(),
        "total_reviews_analyzed": len(reviews),
        "negative_reviews": len(negative_reviews),
        "categorized_complaints": total_categorized,
        "uncategorized_complaints": uncategorized_count,
        "pain_point_categories": category_data,
        "priority_ranking": sorted(
            category_data.keys(),
            key=lambda c: category_data[c]["count"],
            reverse=True
        ),
        "recommendations": [
            {
                "priority": idx + 1,
                "category": cat,
                "complaint_count": category_data[cat]["count"],
                "percentage": category_data[cat]["percentage"],
                "solution": PAIN_POINT_CATEGORIES[cat]["codecash_solution"]
            }
            for idx, cat in enumerate(
                sorted(category_data.keys(), key=lambda c: category_data[c]["count"], reverse=True)
            )
        ]
    }

def print_report(report):
    """Print a formatted console report."""
    print(f"\n{'='*60}")
    print("CODECASH COMPETITOR INTELLIGENCE REPORT")
    print(f"{'='*60}")
    print(f"Generated: {report['generated_at']}")
    print(f"Total Reviews: {report['total_reviews_analyzed']}")
    print(f"Negative Reviews: {report['negative_reviews']}")
    print(f"Categorized Complaints: {report['categorized_complaints']}")
    
    print(f"\n{'─'*60}")
    print("PAIN POINT PRIORITY RANKING")
    print(f"{'─'*60}")
    
    for rec in report["recommendations"]:
        bar_length = int(rec["percentage"] / 2)
        bar = "█" * bar_length + "░" * (25 - bar_length)
        print(f"\n  #{rec['priority']} {rec['category']}")
        print(f"     {bar} {rec['percentage']}% ({rec['complaint_count']} complaints)")
        print(f"     → Solution: {rec['solution']}")
    
    print(f"\n{'='*60}")
    print("TOP COMPETITOR WEAKNESSES → CODECASH OPPORTUNITIES")
    print(f"{'='*60}")
    
    for rec in report["recommendations"][:2]:
        cat_data = report["pain_point_categories"][rec["category"]]
        print(f"\n  🔴 {rec['category']} ({rec['percentage']}%)")
        print(f"     {cat_data['description']}")
        if cat_data["top_examples"]:
            print(f"     Example: \"{cat_data['top_examples'][0]['content'][:100]}...\"")
        print(f"     ✅ CODECASH Fix: {rec['solution']}")

def main():
    print("╔══════════════════════════════════════════════════╗")
    print("║     CODECASH Intelligence Report Generator       ║")
    print("╚══════════════════════════════════════════════════╝")
    
    reviews = load_reviews()
    if not reviews:
        return
    
    report = analyze_reviews(reviews)
    
    # Save report
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False, default=str)
    print(f"\n✓ Report saved to: {REPORT_FILE}")
    
    # Print to console
    print_report(report)

if __name__ == "__main__":
    main()
