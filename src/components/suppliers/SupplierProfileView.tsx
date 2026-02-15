'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe, CheckCircle, Upload, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import ProductShowcaseGrid from './ProductShowcaseGrid';
import ClaimProfileModal from './ClaimProfileModal';
import { cn } from '@/lib/utils';

interface SupplierProfileViewProps {
  supplier: any; // Replace with proper type
  isClaimable: boolean;
}

export default function SupplierProfileView({ 
  supplier, 
  isClaimable 
}: SupplierProfileViewProps) {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Check if user owns this profile (after claim)
  const isOwner = false; // TODO: Check from session

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Company Logo */}
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 relative rounded-lg overflow-hidden bg-gray-100">
                {supplier.logo_url ? (
                  <Image
                    src={supplier.logo_url}
                    alt={supplier.company_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                    <span className="text-white text-4xl font-bold">
                      {supplier.company_name.charAt(0)}
                    </span>
                  </div>
                )}
                {isOwner && (
                  <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                    <Upload className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
                    {supplier.company_name}
                    {supplier.is_verified && (
                      <CheckCircle className="h-7 w-7 text-blue-500" />
                    )}
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">
                    {supplier.business_type} • {supplier.establishment_year && `Est. ${supplier.establishment_year}`}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {isClaimable && (
                    <Button
                      onClick={() => setShowClaimModal(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Claim This Profile
                    </Button>
                  )}
                  {isOwner && (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditMode(!isEditMode)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary" className="text-sm">
                  {supplier.category?.name}
                </Badge>
                {supplier.subcategories?.map((sub: string) => (
                  <Badge key={sub} variant="outline" className="text-sm">
                    {sub}
                  </Badge>
                ))}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="h-5 w-5 flex-shrink-0" />
                  <span>{supplier.city}, {supplier.state}</span>
                </div>
                {supplier.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-5 w-5 flex-shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="h-5 w-5 flex-shrink-0" />
                    <span>{supplier.email}</span>
                  </div>
                )}
                {supplier.website && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Globe className="h-5 w-5 flex-shrink-0" />
                    <a 
                      href={supplier.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      {supplier.business_description && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About Us</h2>
            <p className="text-gray-600 leading-relaxed">
              {supplier.business_description}
            </p>
          </Card>
        </div>
      )}

      {/* Product Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Products & Services
          </h2>
          {isOwner && (
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Add Products
            </Button>
          )}
        </div>
        
        <ProductShowcaseGrid 
          products={supplier.products} 
          supplierId={supplier.id}
          isOwner={isOwner}
          categoryPlaceholder={supplier.category?.name}
        />
      </div>

      {/* Business Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supplier.employee_count && (
              <div>
                <p className="text-sm text-gray-500">Company Size</p>
                <p className="text-lg font-medium">{supplier.employee_count} employees</p>
              </div>
            )}
            {supplier.annual_turnover && (
              <div>
                <p className="text-sm text-gray-500">Annual Turnover</p>
                <p className="text-lg font-medium">{supplier.annual_turnover}</p>
              </div>
            )}
            {supplier.gst_number && (
              <div>
                <p className="text-sm text-gray-500">GST Number</p>
                <p className="text-lg font-medium">{supplier.gst_number}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* SEO Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Why Choose {supplier.company_name}?
          </h3>
          <div className="prose prose-gray max-w-none">
            <ul className="space-y-2">
              <li>Leading {supplier.business_type} in {supplier.city}</li>
              <li>Specializing in {supplier.category?.name} products</li>
              <li>{supplier.establishment_year && `${new Date().getFullYear() - supplier.establishment_year} years of industry experience`}</li>
              <li>Serving customers across {supplier.state} and beyond</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Claim Profile Modal */}
      {showClaimModal && (
        <ClaimProfileModal
          supplier={supplier}
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
        />
      )}
    </div>
  );
}
