'use client';

// =====================================================================
// Customer Web Platform — Product Reviews & Rating Summary
// =====================================================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { PageResponse, Review, ProductRatingSummary } from '@/types';
import { RatingStars } from '@/components/common/rating-stars';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Star, ThumbsUp, CheckCircle, MessageSquarePlus } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface ReviewsSectionProps {
  productId: string;
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  // Review Form States
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formOrderItemId, setFormOrderItemId] = useState('');

  // 1. Fetch Rating Summary
  const { data: summary } = useQuery<ProductRatingSummary>({
    queryKey: ['reviews', productId, 'summary'],
    queryFn: () => api.get<ProductRatingSummary>(API_ENDPOINTS.PRODUCT_RATING_SUMMARY(productId)),
  });

  // 2. Fetch Reviews List
  const { data: reviewsData, isLoading } = useQuery<PageResponse<Review>>({
    queryKey: ['reviews', productId, 'list'],
    queryFn: () => api.get<PageResponse<Review>>(API_ENDPOINTS.PRODUCT_REVIEWS(productId)),
  });

  const reviews = reviewsData?.data || [];
  const averageRating = summary?.averageRating || 0;
  const totalReviews = summary?.totalReviews || 0;
  const dist = summary?.starDistribution || { oneStar: 0, twoStar: 0, threeStar: 0, fourStar: 0, fiveStar: 0 };

  // Calculate percentage for progress bars
  const getPercentage = (count: number) => (totalReviews > 0 ? (count / totalReviews) * 100 : 0);

  // Helpful Vote Mutation
  const helpfulMutation = useMutation({
    mutationFn: (reviewId: string) => api.post(API_ENDPOINTS.REVIEW_HELPFUL(reviewId)),
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
    onError: (err: any) => toast.error(err.message || 'Could not register vote'),
  });

  // Submit Review Mutation
  const reviewMutation = useMutation({
    mutationFn: (payload: any) => api.post(API_ENDPOINTS.REVIEWS, payload),
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      setIsWriteReviewOpen(false);
      setFormTitle('');
      setFormComment('');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to submit review. Verified purchase of this item required.'),
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('otp');
      return;
    }
    if (!formOrderItemId) {
      toast.error('Please enter your Delivered Order Item ID');
      return;
    }
    reviewMutation.mutate({
      productId,
      orderItemId: formOrderItemId.trim(),
      rating: formRating,
      title: formTitle.trim(),
      comment: formComment.trim(),
    });
  };

  return (
    <section id="reviews-section" className="py-10 border-t border-slate-200 dark:border-slate-800 my-8">
      {/* Section Title & Action */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Ratings & Reviews
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real customer feedback from verified buyers
          </p>
        </div>

        <Button
          onClick={() => {
            if (!isAuthenticated) {
              openAuthModal('otp');
            } else {
              setIsWriteReviewOpen(true);
            }
          }}
          variant="outline"
          className="rounded-xl font-bold gap-1.5"
        >
          <MessageSquarePlus className="h-4 w-4 text-blue-600" />
          Write a Review
        </Button>
      </div>

      {/* Summary Score & 5-Star Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50 dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 mb-10">
        {/* Big Average Score */}
        <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
          <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            {averageRating.toFixed(1)}
          </span>
          <div className="my-2">
            <RatingStars rating={averageRating} size="lg" showCount={false} />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Based on {totalReviews.toLocaleString()} verified ratings
          </span>
        </div>

        {/* Star Breakdown Bars */}
        <div className="col-span-2 flex flex-col justify-center space-y-2.5">
          {[
            { label: '5 ★', count: dist.fiveStar, color: 'bg-emerald-500' },
            { label: '4 ★', count: dist.fourStar, color: 'bg-emerald-400' },
            { label: '3 ★', count: dist.threeStar, color: 'bg-amber-400' },
            { label: '2 ★', count: dist.twoStar, color: 'bg-orange-400' },
            { label: '1 ★', count: dist.oneStar, color: 'bg-red-500' },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-semibold">
              <span className="w-8 text-right text-slate-600 dark:text-slate-400">{row.label}</span>
              <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${row.color}`}
                  style={{ width: `${getPercentage(row.count)}%` }}
                />
              </div>
              <span className="w-12 text-slate-400 text-right">{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Cards List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          No reviews yet. Be the first verified buyer to share your experience!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5 shadow-2xs"
            >
              {/* Rating badge & Title */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-extrabold">
                    <span>{rev.rating}</span>
                    <Star className="h-3 w-3 fill-white" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rev.title}</h4>
                </div>
                <span className="text-xs text-slate-400">{formatDate(rev.createdAt)}</span>
              </div>

              {/* Review Comment */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {rev.comment}
              </p>

              {/* Verified Buyer Badge & Helpful Vote */}
              <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-medium">
                  {rev.verifiedBuyer && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle className="h-3.5 w-3.5" /> Verified Buyer
                    </span>
                  )}
                  <span>• {rev.customerName || 'Customer'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => helpfulMutation.mutate(rev.id)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 font-semibold transition-colors"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Helpful ({rev.helpfulVotes || 0})</span>
                </button>
              </div>

              {/* Seller Official Response if any */}
              {rev.sellerResponse && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-l-4 border-blue-600 text-xs">
                  <span className="font-bold text-blue-600 block mb-1">Official Seller Response:</span>
                  <p className="text-slate-600 dark:text-slate-300">{rev.sellerResponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Write a Review Modal ────────────────────────────────────── */}
      <Dialog open={isWriteReviewOpen} onOpenChange={setIsWriteReviewOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              Write a Verified Buyer Review
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Your Star Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= formRating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Delivered Order Item ID *
              </label>
              <Input
                placeholder="UUID from your delivered order"
                value={formOrderItemId}
                onChange={(e) => setFormOrderItemId(e.target.value)}
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Found on your order details page for delivered items.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Review Headline *
              </label>
              <Input
                placeholder="e.g. Fantastic performance and battery life!"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Detailed Feedback *
              </label>
              <textarea
                rows={4}
                placeholder="What did you like or dislike about this product?"
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-hidden focus:border-blue-500"
                required
              />
            </div>

            <Button type="submit" className="w-full h-11" isLoading={reviewMutation.isPending}>
              Submit Review
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
