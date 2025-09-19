"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSingleEvent } from "@/components/useSingleEvent";
import { useEventStatus, EventStatus } from "@/components/useEventStatus";
import {
  Calendar,
  MapPin,
  DollarSign,
  User,
  Image as ImageIcon,
  Video,
  ArrowLeft,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
} from "lucide-react";

export default function EventDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>("pending");
  const [isSliderPlaying, setIsSliderPlaying] = useState(true);
  const [eventId, setEventId] = useState<string>("68c6b4a5141d5e59c64e1059"); // Hardcoded for testing

  const { updateEventStatus, loading: statusLoading } = useEventStatus();
  const { event, loading, error } = useSingleEvent(eventId);

  console.log("EventDetailPage rendered with eventId:", eventId);
  console.log("Event:", event);
  console.log("Loading:", loading);
  console.log("Error:", error);

  // Update selected status when event data changes
  useEffect(() => {
    if (event) {
      setSelectedStatus(event.status as EventStatus);
    }
  }, [event]);

  // Auto-slide images every 3 seconds
  useEffect(() => {
    if (!event?.images || event.images.length <= 1 || !isSliderPlaying) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === event.images.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [event, currentImageIndex, isSliderPlaying]);

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
      case "suspended":
        return "bg-orange-100 text-orange-800 border-orange-200";
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

  const handleStatusUpdate = async () => {
    if (!event) return;

    const success = await updateEventStatus(event._id, selectedStatus);
    if (success) {
      setIsEditModalOpen(false);
    }
  };

  const nextImage = () => {
    if (!event?.images) return;
    setCurrentImageIndex((prev) =>
      prev === event.images.length - 1 ? 0 : prev + 1
    );
    setIsSliderPlaying(false);
  };

  const prevImage = () => {
    if (!event?.images) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? event.images.length - 1 : prev - 1
    );
    setIsSliderPlaying(false);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>
            Event Not Found
          </h2>
          <p className='text-gray-600 dark:text-gray-300 mb-4'>
            {error || "The requested event could not be found."}
          </p>
          <Button
            onClick={() => window.history.back()}
            className='bg-blue-600 hover:bg-blue-700'
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full animate-fade-in'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <Button
            onClick={() => window.history.back()}
            variant='outline'
            className='mb-4 hover:bg-gray-50 dark:hover:bg-gray-800'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Events
          </Button>

          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2'>
                {event.name}
              </h1>
              <p className='text-gray-500 dark:text-gray-300'>
                Event Details and Management
              </p>
            </div>

            <div className='flex items-center gap-3'>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  event.status
                )}`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                  event.category
                )}`}
              >
                {event.category.charAt(0).toUpperCase() +
                  event.category.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Image Slider */}
            {event.images && event.images.length > 0 && (
              <div className='relative'>
                <div className='relative h-96 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800'>
                  <Image
                    src={event.images[currentImageIndex].url}
                    alt={event.name}
                    fill
                    className='object-cover cursor-pointer transition-transform duration-300 hover:scale-105'
                    onClick={() => setIsImageModalOpen(true)}
                  />

                  {/* Slider Controls */}
                  {event.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors'
                      >
                        <ChevronLeft className='w-5 h-5' />
                      </button>
                      <button
                        onClick={nextImage}
                        className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors'
                      >
                        <ChevronRight className='w-5 h-5' />
                      </button>

                      {/* Play/Pause Button */}
                      <button
                        onClick={() => setIsSliderPlaying(!isSliderPlaying)}
                        className='absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors'
                      >
                        {isSliderPlaying ? (
                          <Pause className='w-4 h-4' />
                        ) : (
                          <Play className='w-4 h-4' />
                        )}
                      </button>

                      {/* Dots Indicator */}
                      <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2'>
                        {event.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex
                                ? "bg-white"
                                : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Event Description */}
            <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
                Description
              </h2>
              <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                {event.description}
              </p>
            </div>

            {/* Videos */}
            {event.videos && event.videos.length > 0 && (
              <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center'>
                  <Video className='w-6 h-6 mr-2 text-blue-500' />
                  Event Videos
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {event.videos.map((video) => (
                    <div key={video._id} className='relative'>
                      <video
                        controls
                        className='w-full h-48 rounded-lg bg-gray-100 dark:bg-gray-700'
                        poster={event.images?.[0]?.url}
                      >
                        <source src={video.url} type='video/mp4' />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center'>
                <MapPin className='w-6 h-6 mr-2 text-red-500' />
                Event Location
              </h2>
              <p className='text-gray-600 dark:text-gray-300 mb-4'>
                {event.location.address}
              </p>
              <div className='h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
                <div className='text-center'>
                  <MapPin className='w-12 h-12 text-gray-400 mx-auto mb-2' />
                  <p className='text-gray-500 dark:text-gray-400'>
                    Map Integration
                  </p>
                  <p className='text-sm text-gray-400'>
                    Coordinates: {event.location.coordinates.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Event Details */}
            <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
                Event Details
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center text-gray-600 dark:text-gray-300'>
                  <Calendar className='w-5 h-5 mr-3 text-blue-500' />
                  <span>{formatDate(event.dateTime)}</span>
                </div>

                <div className='flex items-center text-gray-600 dark:text-gray-300'>
                  <DollarSign className='w-5 h-5 mr-3 text-green-500' />
                  <span>${event.ticket_price}</span>
                </div>

                <div className='flex items-center text-gray-600 dark:text-gray-300'>
                  <User className='w-5 h-5 mr-3 text-purple-500' />
                  <span className='truncate'>{event.userId.email}</span>
                </div>
              </div>
            </div>

            {/* Media Summary */}
            <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
                Media
              </h3>
              <div className='space-y-3'>
                {event.images && event.images.length > 0 && (
                  <div className='flex items-center text-gray-600 dark:text-gray-300'>
                    <ImageIcon className='w-5 h-5 mr-3 text-blue-500' />
                    <span>
                      {event.images.length} image
                      {event.images.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {event.videos && event.videos.length > 0 && (
                  <div className='flex items-center text-gray-600 dark:text-gray-300'>
                    <Video className='w-5 h-5 mr-3 text-red-500' />
                    <span>
                      {event.videos.length} video
                      {event.videos.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
                Actions
              </h3>
              <div className='space-y-3'>
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white'
                >
                  <Edit className='w-4 h-4 mr-2' />
                  Update Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && event.images && (
        <div className='fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4'>
          <div className='relative max-w-4xl max-h-full'>
            <button
              onClick={() => setIsImageModalOpen(false)}
              className='absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10'
            >
              <X className='w-6 h-6' />
            </button>
            <Image
              src={event.images[currentImageIndex].url}
              alt={event.name}
              width={800}
              height={600}
              className='max-w-full max-h-full object-contain rounded-lg'
            />
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {isEditModalOpen && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full animate-modal-in'>
            <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
              Update Event Status
            </h3>
            <p className='text-gray-600 dark:text-gray-300 mb-6'>
              Select the new status for this event:
            </p>

            <div className='space-y-3 mb-6'>
              {(
                [
                  "pending",
                  "approved",
                  "rejected",
                  "suspended",
                ] as EventStatus[]
              ).map((status) => (
                <label key={status} className='flex items-center'>
                  <input
                    type='radio'
                    name='status'
                    value={status}
                    checked={selectedStatus === status}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as EventStatus)
                    }
                    className='mr-3'
                  />
                  <span className='text-gray-900 dark:text-white capitalize'>
                    {status}
                  </span>
                </label>
              ))}
            </div>

            <div className='flex gap-3'>
              <Button
                onClick={() => setIsEditModalOpen(false)}
                variant='outline'
                className='flex-1'
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={statusLoading}
                className='flex-1 bg-blue-600 hover:bg-blue-700 text-white'
              >
                {statusLoading ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </div>
      )}

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

        @keyframes modal-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-modal-in {
          animation: modal-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
