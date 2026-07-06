import React from "react";
import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { useI18n } from "@/hooks/use-i18n";

export type CommunityNews = {
  id: string;
  type: "news";
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
};

export type PollOption = {
  id: string | number;
  text: string;
  votes: number;
};

export type CommunityPoll = {
  id: string;
  type: "poll";
  question: string;
  options: PollOption[];
  totalVotes: number;
  votedOptionId: string | boolean;
  date: string;
  pollDurationDays?: number;
  pollDeadlineDate?: string;
  pollStatus?: "open" | "closed";
  canVote?: boolean;
};

export type CommunityUpdate = CommunityNews | CommunityPoll;

export type VisitorInvite = {
  id: string;
  reference: string;
  visitorName: string;
  visitDate: string;
  visitTime: string;
  purpose: "social" | "maintenance" | "delivery" | "business" | "other";
  accessCode: string;
  state: "active" | "cancelled" | "expired";
};

export type FeedbackItem = {
  id: string;
  reference: string;
  subject: string;
  category: "complaint" | "suggestion";
  details: string;
  state: "new" | "reviewed" | "closed";
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "payment" | "maintenance" | "visitor" | "announcement" | "task_assigned" | "inspection" | "general";
  unread: boolean;
  read: boolean;
};

export type CreateVisitorParams = {
  visitorName: string;
  visitDate: string;
  visitTime: string;
  purpose: string;
};

export type SubmitFeedbackParams = {
  subject: string;
  category: "complaint" | "suggestion";
  details: string;
};

export type PaginatedUpdates = {
  items: CommunityUpdate[];
  nextCursor: string | false;
  hasMore: boolean;
};

export type PaginatedVisitors = {
  items: VisitorInvite[];
  nextCursor: string | false;
  hasMore: boolean;
};

export type PaginatedFeedbacks = {
  items: FeedbackItem[];
  nextCursor: string | false;
  hasMore: boolean;
};

export type PaginatedNotifications = {
  items: NotificationItem[];
  nextCursor: string | false;
  hasMore: boolean;
};

export function useCommunityStore(options?: {
  enableUpdates?: boolean;
  enableVisitors?: boolean;
  enableFeedbacks?: boolean;
  enableNotifications?: boolean;
}) {
  const queryClient = useQueryClient();
  const { language } = useI18n();

  const enableUpdates = options?.enableUpdates ?? false;
  const enableVisitors = options?.enableVisitors ?? false;
  const enableFeedbacks = options?.enableFeedbacks ?? false;
  const enableNotifications = options?.enableNotifications ?? false;

  // Queries
  const updatesQuery = useInfiniteQuery<PaginatedUpdates>({
    queryKey: ["community-updates", language],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedUpdates>("/community/updates", { limit: 20, cursor: pageParam, lang: language }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled: enableUpdates,
  });

  const visitorsQuery = useInfiniteQuery<PaginatedVisitors>({
    queryKey: ["visitors"],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedVisitors>("/resident/visitors", { limit: 20, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled: enableVisitors,
  });

  const feedbacksQuery = useInfiniteQuery<PaginatedFeedbacks>({
    queryKey: ["feedbacks"],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedFeedbacks>("/resident/feedback", { limit: 20, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled: enableFeedbacks,
  });

  const notificationsQuery = useInfiniteQuery<PaginatedNotifications>({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedNotifications>("/notifications", { limit: 20, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled: enableNotifications,
  });

  // Mutations
  const votePollMutation = useMutation({
    mutationFn: (params: { pollId: string; optionId: string | number }) => {
      const optionIdNum = typeof params.optionId === "number" ? params.optionId : parseInt(params.optionId, 10);
      return apiRequest(`/community/polls/${params.pollId}/vote`, { optionId: optionIdNum });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-updates"] });
    }
  });

  const createVisitorMutation = useMutation({
    mutationFn: (params: CreateVisitorParams) => apiRequest<VisitorInvite>("/resident/visitors/invite", params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
    }
  });

  const cancelVisitorMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/resident/visitors/${id}/cancel`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
    }
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: (params: SubmitFeedbackParams) => apiRequest("/resident/feedback/submit", params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    }
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ id: string; read: boolean; unread: boolean }>(`/notifications/${id}/read`, {}),
    onSuccess: (data, id) => {
      queryClient.setQueryData<{ pages: PaginatedNotifications[]; pageParams: any[] }>(
        ["notifications"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === id ? { ...item, unread: false, read: true } : item
              ),
            })),
          };
        }
      );
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => apiRequest<{ markedRead: number }>("/notifications/mark-all-read", {}),
    onSuccess: () => {
      queryClient.setQueryData<{ pages: PaginatedNotifications[]; pageParams: any[] }>(
        ["notifications"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((item) => ({ ...item, unread: false, read: true })),
            })),
          };
        }
      );
    },
  });

  // States
  const updates = React.useMemo(() => updatesQuery.data?.pages.flatMap((page) => page.items) || [], [updatesQuery.data]);
  const visitors = React.useMemo(() => visitorsQuery.data?.pages.flatMap((page) => page.items) || [], [visitorsQuery.data]);
  const feedbacks = React.useMemo(() => feedbacksQuery.data?.pages.flatMap((page) => page.items) || [], [feedbacksQuery.data]);
  const notifications = React.useMemo(() => notificationsQuery.data?.pages.flatMap((page) => page.items) || [], [notificationsQuery.data]);
  
  const loading =
    updatesQuery.isLoading ||
    updatesQuery.isFetchingNextPage ||
    visitorsQuery.isLoading ||
    visitorsQuery.isFetchingNextPage ||
    feedbacksQuery.isLoading ||
    feedbacksQuery.isFetchingNextPage ||
    notificationsQuery.isLoading ||
    notificationsQuery.isFetchingNextPage ||
    votePollMutation.isPending ||
    createVisitorMutation.isPending ||
    cancelVisitorMutation.isPending ||
    submitFeedbackMutation.isPending ||
    markNotificationReadMutation.isPending ||
    markAllNotificationsReadMutation.isPending;

  const error =
    updatesQuery.error?.message ||
    visitorsQuery.error?.message ||
    feedbacksQuery.error?.message ||
    notificationsQuery.error?.message ||
    votePollMutation.error?.message ||
    createVisitorMutation.error?.message ||
    cancelVisitorMutation.error?.message ||
    submitFeedbackMutation.error?.message ||
    markNotificationReadMutation.error?.message ||
    markAllNotificationsReadMutation.error?.message ||
    null;

  // Actions
  const fetchUpdates = React.useCallback(async () => {
    await updatesQuery.refetch();
  }, [updatesQuery]);

  const fetchNextUpdates = React.useCallback(async () => {
    if (updatesQuery.hasNextPage && !updatesQuery.isFetchingNextPage) {
      await updatesQuery.fetchNextPage();
    }
  }, [updatesQuery]);

  const fetchUpdateDetails = React.useCallback(async (id: string) => {
    return await apiRequest<CommunityUpdate>(`/community/updates/${id}`, { lang: language });
  }, [language]);

  const votePoll = React.useCallback(async (pollId: string, optionId: string | number) => {
    await votePollMutation.mutateAsync({ pollId, optionId });
  }, [votePollMutation]);

  const fetchVisitors = React.useCallback(async () => {
    await visitorsQuery.refetch();
  }, [visitorsQuery]);

  const fetchNextVisitors = React.useCallback(async () => {
    if (visitorsQuery.hasNextPage && !visitorsQuery.isFetchingNextPage) {
      await visitorsQuery.fetchNextPage();
    }
  }, [visitorsQuery]);

  const createVisitor = React.useCallback(async (params: CreateVisitorParams) => {
    return await createVisitorMutation.mutateAsync(params);
  }, [createVisitorMutation]);

  const cancelVisitor = React.useCallback(async (id: string) => {
    await cancelVisitorMutation.mutateAsync(id);
  }, [cancelVisitorMutation]);

  const fetchFeedbacks = React.useCallback(async () => {
    await feedbacksQuery.refetch();
  }, [feedbacksQuery]);

  const fetchNextFeedbacks = React.useCallback(async () => {
    if (feedbacksQuery.hasNextPage && !feedbacksQuery.isFetchingNextPage) {
      await feedbacksQuery.fetchNextPage();
    }
  }, [feedbacksQuery]);

  const submitFeedback = React.useCallback(async (params: SubmitFeedbackParams) => {
    return await submitFeedbackMutation.mutateAsync(params);
  }, [submitFeedbackMutation]);

  const fetchNotifications = React.useCallback(async () => {
    await notificationsQuery.refetch();
  }, [notificationsQuery]);

  const fetchNextNotifications = React.useCallback(async () => {
    if (notificationsQuery.hasNextPage && !notificationsQuery.isFetchingNextPage) {
      await notificationsQuery.fetchNextPage();
    }
  }, [notificationsQuery]);

  const markNotificationRead = React.useCallback(async (id: string) => {
    await markNotificationReadMutation.mutateAsync(id);
  }, [markNotificationReadMutation]);

  const markAllNotificationsRead = React.useCallback(async () => {
    await markAllNotificationsReadMutation.mutateAsync();
  }, [markAllNotificationsReadMutation]);

  const clearError = React.useCallback(() => {}, []);

  return {
    updates,
    visitors,
    feedbacks,
    notifications,
    loading,
    error,
    fetchUpdates,
    fetchNextUpdates,
    hasNextUpdates: updatesQuery.hasNextPage,
    fetchUpdateDetails,
    votePoll,
    fetchVisitors,
    fetchNextVisitors,
    hasNextVisitors: visitorsQuery.hasNextPage,
    createVisitor,
    cancelVisitor,
    fetchFeedbacks,
    fetchNextFeedbacks,
    hasNextFeedbacks: feedbacksQuery.hasNextPage,
    submitFeedback,
    fetchNotifications,
    fetchNextNotifications,
    hasNextNotifications: notificationsQuery.hasNextPage,
    markNotificationRead,
    markAllNotificationsRead,
    clearError,
  };
}
