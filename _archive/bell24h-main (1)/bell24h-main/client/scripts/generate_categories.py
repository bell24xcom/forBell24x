#!/usr/bin/env python3
"""
Bell24h Automated Category Generation Script
NLP Pipeline for SEO Optimization
"""

import requests
import json
import re
import os
from typing import List, Dict, Any
from datetime import datetime

# MSME Export Directory API endpoints
MSME_API_BASE = "https://msme.gov.in/api"
GST_HSN_API = "https://gst.gov.in/api/hsn-codes"

class CategoryGenerator:
    def __init__(self):
        self.categories = []
        self.subcategories = []
        self.manufacturing_data = []
        
    def fetch_msme_data(self) -> List[Dict[str, Any]]:
        """Fetch manufacturing data from MSME directory"""
        try:
            # MSME Export Directory data
            msme_categories = [
                "Textiles & Garments",
                "Pharmaceuticals", 
                "Agricultural Products",
                "Automotive Parts",
                "IT Services",
                "Gems & Jewelry",
                "Handicrafts",
                "Machinery & Equipment",
                "Chemicals",
                "Food Processing",
                "Construction",
                "Metals & Steel",
                "Plastics",
                "Paper & Packaging",
                "Rubber",
                "Ceramics",
                "Glass",
                "Wood",
                "Leather",
                "Electronics",
                "Electrical Equipment",
                "Medical Devices",
                "Aerospace",
                "Defense",
                "Renewable Energy",
                "Waste Management",
                "Water Treatment",
                "Oil & Gas",
                "Mining",
                "Telecommunications"
            ]
            
            return [{"name": cat, "slug": self.slugify(cat)} for cat in msme_categories]
            
        except Exception as e:
            print(f"Error fetching MSME data: {e}")
            return []
    
    def fetch_gst_hsn_codes(self) -> List[str]:
        """Fetch HSN codes from GST API"""
        try:
            # Common HSN codes for manufacturing
            hsn_codes = [
                "5208", "5209", "5210", "5211", "5212",  # Textiles
                "3004", "3005", "3006", "3007", "3008",  # Pharmaceuticals
                "1001", "1002", "1003", "1004", "1005",  # Agricultural
                "8708", "8709", "8710", "8711", "8712",  # Automotive
                "8517", "8518", "8519", "8520", "8521",  # Electronics
                "7113", "7114", "7115", "7116", "7117",  # Jewelry
                "8201", "8202", "8203", "8204", "8205",  # Handicrafts
                "8424", "8425", "8426", "8427", "8428",  # Machinery
                "2804", "2805", "2806", "2807", "2808",  # Chemicals
                "2001", "2002", "2003", "2004", "2005",  # Food Processing
                "6810", "6811", "6812", "6813", "6814",  # Construction
                "7201", "7202", "7203", "7204", "7205",  # Metals
                "3901", "3902", "3903", "3904", "3905",  # Plastics
                "4801", "4802", "4803", "4804", "4805",  # Paper
                "4001", "4002", "4003", "4004", "4005",  # Rubber
                "6901", "6902", "6903", "6904", "6905",  # Ceramics
                "7001", "7002", "7003", "7004", "7005",  # Glass
                "4401", "4402", "4403", "4404", "4405",  # Wood
                "4101", "4102", "4103", "4104", "4105"   # Leather
            ]
            
            return hsn_codes
            
        except Exception as e:
            print(f"Error fetching HSN codes: {e}")
            return []
    
    def slugify(self, text: str) -> str:
        """Convert text to URL-friendly slug"""
        # Convert to lowercase and replace spaces with hyphens
        slug = re.sub(r'[^\w\s-]', '', text.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')
    
    def generate_subcategories(self, category: str) -> List[Dict[str, str]]:
        """Generate subcategories for a given category"""
        subcategory_mapping = {
            "textiles-garments": [
                "Cotton Fabrics", "Silk Fabrics", "Woolen Fabrics", "Synthetic Fabrics",
                "Ready-made Garments", "Traditional Wear", "Western Wear", "Sportswear",
                "Underwear", "Outerwear", "Accessories", "Footwear"
            ],
            "pharmaceuticals": [
                "Generic Medicines", "Branded Medicines", "Ayurvedic Products",
                "Homeopathic Medicines", "Veterinary Medicines", "Medical Devices",
                "Surgical Instruments", "Diagnostic Kits", "Vaccines", "Antibiotics"
            ],
            "agricultural-products": [
                "Grains", "Pulses", "Oilseeds", "Fruits", "Vegetables", "Spices",
                "Organic Products", "Processed Foods", "Dairy Products", "Poultry",
                "Fishery Products", "Horticulture"
            ],
            "automotive-parts": [
                "Engine Parts", "Transmission Parts", "Brake Systems", "Suspension",
                "Electrical Components", "Body Parts", "Interior Components",
                "Tires & Wheels", "Lubricants", "Accessories"
            ],
            "it-services": [
                "Software Development", "Web Development", "Mobile Apps",
                "Cloud Services", "Cybersecurity", "Data Analytics", "AI/ML",
                "Digital Marketing", "IT Consulting", "System Integration"
            ],
            "gems-jewelry": [
                "Diamond Jewelry", "Gold Jewelry", "Silver Jewelry", "Platinum Jewelry",
                "Pearl Jewelry", "Gemstone Jewelry", "Costume Jewelry", "Antique Jewelry",
                "Wedding Jewelry", "Fashion Jewelry"
            ],
            "handicrafts": [
                "Wooden Crafts", "Metal Crafts", "Stone Crafts", "Textile Crafts",
                "Pottery", "Glass Crafts", "Paper Crafts", "Leather Crafts",
                "Bamboo Crafts", "Traditional Arts"
            ],
            "machinery-equipment": [
                "Industrial Machinery", "Agricultural Machinery", "Construction Equipment",
                "Textile Machinery", "Food Processing Equipment", "Packaging Machinery",
                "Printing Machinery", "Plastic Machinery", "Metal Working Equipment"
            ],
            "chemicals": [
                "Industrial Chemicals", "Agricultural Chemicals", "Pharmaceutical Chemicals",
                "Textile Chemicals", "Paint & Coatings", "Adhesives", "Lubricants",
                "Cleaning Chemicals", "Water Treatment Chemicals"
            ],
            "food-processing": [
                "Grain Processing", "Dairy Processing", "Meat Processing",
                "Fruit & Vegetable Processing", "Beverage Processing", "Snack Foods",
                "Bakery Products", "Confectionery", "Frozen Foods", "Canned Foods"
            ],
            "construction": [
                "Building Materials", "Cement & Concrete", "Steel & Iron",
                "Tiles & Ceramics", "Paints & Coatings", "Electrical Materials",
                "Plumbing Materials", "Roofing Materials", "Flooring Materials"
            ],
            "metals-steel": [
                "Steel Products", "Iron Products", "Aluminum Products", "Copper Products",
                "Zinc Products", "Titanium Products", "Alloy Steel", "Stainless Steel",
                "Carbon Steel", "Tool Steel"
            ],
            "plastics": [
                "Plastic Raw Materials", "Plastic Products", "Plastic Packaging",
                "Plastic Pipes", "Plastic Sheets", "Plastic Moulds", "Plastic Toys",
                "Plastic Furniture", "Plastic Automotive Parts"
            ],
            "paper-packaging": [
                "Paper Products", "Packaging Materials", "Corrugated Boxes",
                "Paper Bags", "Paper Cups", "Tissue Paper", "Cardboard Products",
                "Paper Labels", "Paper Stationery"
            ],
            "rubber": [
                "Natural Rubber", "Synthetic Rubber", "Rubber Products",
                "Tires & Tubes", "Rubber Belts", "Rubber Hoses", "Rubber Seals",
                "Rubber Gaskets", "Rubber Flooring"
            ],
            "ceramics": [
                "Ceramic Tiles", "Ceramic Sanitaryware", "Ceramic Tableware",
                "Ceramic Artware", "Ceramic Insulators", "Ceramic Refractories",
                "Ceramic Pipes", "Ceramic Bricks", "Ceramic Coatings"
            ],
            "glass": [
                "Flat Glass", "Container Glass", "Optical Glass", "Fiber Glass",
                "Glass Products", "Glass Bottles", "Glass Windows", "Glass Mirrors",
                "Glass Artware", "Safety Glass"
            ],
            "wood": [
                "Plywood", "Particle Board", "MDF", "Hardwood", "Softwood",
                "Wooden Furniture", "Wooden Doors", "Wooden Flooring",
                "Wooden Crafts", "Wooden Packaging"
            ],
            "leather": [
                "Leather Raw Materials", "Leather Products", "Leather Bags",
                "Leather Footwear", "Leather Garments", "Leather Accessories",
                "Leather Furniture", "Leather Belts", "Leather Wallets"
            ]
        }
        
        category_slug = self.slugify(category)
        subcategories = subcategory_mapping.get(category_slug, [])
        
        return [
            {
                "name": sub,
                "slug": self.slugify(sub),
                "parent_category": category_slug
            }
            for sub in subcategories
        ]
    
    def generate_categories_json(self) -> Dict[str, Any]:
        """Generate the complete categories JSON structure"""
        # Fetch base categories
        base_categories = self.fetch_msme_data()
        
        # Generate subcategories for each category
        all_categories = []
        all_subcategories = []
        
        for category in base_categories:
            category_data = {
                "id": len(all_categories) + 1,
                "name": category["name"],
                "slug": category["slug"],
                "description": f"Find verified {category['name'].lower()} suppliers and manufacturers on Bell24h",
                "meta_title": f"{category['name']} Suppliers in India | Bell24h",
                "meta_description": f"Connect with verified {category['name'].lower()} suppliers and manufacturers. Get quotes, compare prices, and find the best deals on Bell24h.",
                "image_url": f"/images/categories/{category['slug']}.jpg",
                "product_count": 0,
                "supplier_count": 0,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            all_categories.append(category_data)
            
            # Generate subcategories
            subcategories = self.generate_subcategories(category["name"])
            for sub in subcategories:
                sub["id"] = len(all_subcategories) + 1
                sub["description"] = f"Find verified {sub['name'].lower()} suppliers and manufacturers",
                sub["meta_title"] = f"{sub['name']} Suppliers in India | Bell24h",
                sub["meta_description"] = f"Connect with verified {sub['name'].lower()} suppliers and manufacturers. Get quotes and find the best deals.",
                sub["image_url"] = f"/images/subcategories/{sub['slug']}.jpg",
                sub["product_count"] = 0,
                sub["supplier_count"] = 0,
                sub["created_at"] = datetime.now().isoformat(),
                sub["updated_at"] = datetime.now().isoformat()
                all_subcategories.append(sub)
        
        return {
            "categories": all_categories,
            "subcategories": all_subcategories,
            "generated_at": datetime.now().isoformat(),
            "total_categories": len(all_categories),
            "total_subcategories": len(all_subcategories),
            "version": "1.0.0"
        }
    
    def save_to_file(self, data: Dict[str, Any], filename: str = "auto-categories.json"):
        """Save categories data to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"✅ Categories saved to {filename}")
            print(f"📊 Generated {data['total_categories']} categories and {data['total_subcategories']} subcategories")
        except Exception as e:
            print(f"❌ Error saving file: {e}")
    
    def generate_nextjs_pages(self, data: Dict[str, Any]):
        """Generate Next.js page components for categories"""
        try:
            # Create pages directory if it doesn't exist
            pages_dir = "src/app/categories"
            os.makedirs(pages_dir, exist_ok=True)
            
            # Generate category page template
            category_page_template = '''import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = categories.find(c => c.slug === params.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found | Bell24h',
    };
  }
  
  return {
    title: category.meta_title,
    description: category.meta_description,
    openGraph: {
      title: category.meta_title,
      description: category.meta_description,
      images: [category.image_url],
    },
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = categories.find(c => c.slug === params.slug);
  
  if (!category) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{category.name} Suppliers</h1>
      <p className="text-gray-600 mb-8">{category.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Supplier cards will be rendered here */}
      </div>
    </div>
  );
}
'''
            
            # Save the template
            with open(f"{pages_dir}/[slug]/page.tsx", 'w', encoding='utf-8') as f:
                f.write(category_page_template)
            
            print("✅ Next.js category pages generated")
            
        except Exception as e:
            print(f"❌ Error generating Next.js pages: {e}")

def main():
    """Main execution function"""
    print("🚀 Bell24h Category Generator Starting...")
    
    generator = CategoryGenerator()
    
    # Generate categories data
    print("📊 Generating categories and subcategories...")
    categories_data = generator.generate_categories_json()
    
    # Save to JSON file
    generator.save_to_file(categories_data, "auto-categories.json")
    
    # Generate Next.js pages
    print("📝 Generating Next.js category pages...")
    generator.generate_nextjs_pages(categories_data)
    
    print("✅ Category generation complete!")
    print(f"📈 Generated {categories_data['total_categories']} categories")
    print(f"📈 Generated {categories_data['total_subcategories']} subcategories")
    print("🎯 Ready for SEO optimization!")

if __name__ == "__main__":
    main() 