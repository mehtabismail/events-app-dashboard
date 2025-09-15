"use client";

import React from "react";
import Image from "next/image";
import { useEvents } from "@/components/useEvents";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  DollarSign,
  User,
  Image as ImageIcon,
  Video,
} from "lucide-react";

export default function DashboardEvents() {
  const { events, loading, error, refetch } = useEvents();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "concert":
        return "bg-purple-100 text-purple-800";
      case "conference":
        return "bg-blue-100 text-blue-800";
      case "workshop":
        return "bg-green-100 text-green-800";
      case "sports":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>
            Error Loading Events
          </h2>
          <p className='text-gray-600 mb-4'>{error}</p>
          <Button onClick={refetch} className='bg-blue-600 hover:bg-blue-700'>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2'>
            Events Dashboard
          </h1>
          <p className='text-gray-500 dark:text-gray-300'>
            Manage and view all events in your system
          </p>
          <div className='mt-4 flex items-center gap-4'>
            <Button
              onClick={refetch}
              variant='outline'
              className='hover:bg-blue-50'
            >
              Refresh Events
            </Button>
            <span className='text-sm text-gray-500 dark:text-gray-300'>
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>

        {/* Events Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {events.map((event, index) => (
            <div
              key={event._id}
              className='bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Event Image */}
              <div className='relative h-48 rounded-t-xl overflow-hidden'>
                {event.images && event.images.length > 0 ? (
                  <Image
                    src={event.images[0].url}
                    alt={event.name}
                    width={400}
                    height={192}
                    className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
                  />
                ) : (
                  <div className='w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center'>
                    <ImageIcon className='w-12 h-12 text-white opacity-50' />
                  </div>
                )}

                {/* Status Badge */}
                <div className='absolute top-3 right-3'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </span>
                </div>

                {/* Category Badge */}
                <div className='absolute top-3 left-3'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      event.category
                    )}`}
                  >
                    {event.category.charAt(0).toUpperCase() +
                      event.category.slice(1)}
                  </span>
                </div>
              </div>

              {/* Event Content */}
              <div className='p-6'>
                <h3 className='text-xl font-bold text-gray-900 mb-2 line-clamp-2'>
                  {event.name}
                </h3>

                <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                  {event.description}
                </p>

                {/* Event Details */}
                <div className='space-y-3'>
                  <div className='flex items-center text-sm text-gray-600'>
                    <Calendar className='w-4 h-4 mr-2 text-blue-500' />
                    <span>{formatDate(event.dateTime)}</span>
                  </div>

                  <div className='flex items-center text-sm text-gray-600'>
                    <MapPin className='w-4 h-4 mr-2 text-red-500' />
                    <span className='truncate'>{event.location.address}</span>
                  </div>

                  <div className='flex items-center text-sm text-gray-600'>
                    <DollarSign className='w-4 h-4 mr-2 text-green-500' />
                    <span>${event.ticket_price}</span>
                  </div>

                  <div className='flex items-center text-sm text-gray-600'>
                    <User className='w-4 h-4 mr-2 text-purple-500' />
                    <span className='truncate'>{event.userId.email}</span>
                  </div>
                </div>

                {/* Media Indicators */}
                <div className='flex items-center gap-4 mt-4 pt-4 border-t border-gray-100'>
                  {event.images && event.images.length > 0 && (
                    <div className='flex items-center text-xs text-gray-500'>
                      <ImageIcon className='w-3 h-3 mr-1' />
                      <span>
                        {event.images.length} image
                        {event.images.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  {event.videos && event.videos.length > 0 && (
                    <div className='flex items-center text-xs text-gray-500'>
                      <Video className='w-3 h-3 mr-1' />
                      <span>
                        {event.videos.length} video
                        {event.videos.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className='mt-4 flex gap-2'>
                  <Button
                    size='sm'
                    className='flex-1 bg-blue-600 hover:bg-blue-700 text-white'
                  >
                    View Details
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    className='hover:bg-gray-50 !text-black dark:text-white border border-gray-300 dark:border-gray-600'
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {events.length === 0 && (
          <div className='text-center py-12'>
            <div className='w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
              <Calendar className='w-12 h-12 text-gray-400' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              No Events Found
            </h3>
            <p className='text-gray-600 mb-4'>
              There are no events to display at the moment.
            </p>
            <Button onClick={refetch} className='bg-blue-600 hover:bg-blue-700'>
              Refresh
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
