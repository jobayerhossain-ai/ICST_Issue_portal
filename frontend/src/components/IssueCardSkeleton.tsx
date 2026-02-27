import { motion } from 'framer-motion';

export const IssueCardSkeleton = () => {
    return (
        <div className="relative bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm animate-pulse">
            {/* Image Skeleton */}
            <div className="relative h-48 w-full bg-slate-200" />

            <div className="p-5">
                {/* Title Skeleton */}
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-4" />

                {/* Description Skeleton */}
                <div className="space-y-2 mb-6">
                    <div className="h-4 w-full bg-slate-200 rounded" />
                    <div className="h-4 w-5/6 bg-slate-200 rounded" />
                </div>

                {/* Progress Bar Skeleton */}
                <div className="mb-6 space-y-2">
                    <div className="flex justify-between">
                        <div className="h-3 w-12 bg-slate-200 rounded" />
                        <div className="h-3 w-12 bg-slate-200 rounded" />
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full" />
                </div>

                {/* Meta details Skeleton */}
                <div className="flex justify-between mb-6 border-b border-slate-100 pb-4">
                    <div className="h-4 w-16 bg-slate-200 rounded" />
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                    <div className="h-4 w-10 bg-slate-200 rounded" />
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex gap-3">
                    <div className="flex-1 h-10 bg-slate-200 rounded-lg" />
                    <div className="flex-1 h-10 bg-slate-200 rounded-lg" />
                    <div className="w-12 h-10 bg-slate-200 rounded-lg" />
                </div>
            </div>
        </div>
    );
};
