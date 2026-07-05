import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  id: string;
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
  const updatesQuery = useQuery<CommunityUpdate[]>({
    queryKey: ["community-updates", language],
    queryFn: () => apiRequest<CommunityUpdate[]>("/community/updates", { limit: 50, lang: language }),
    enabled: enableUpdates,
  });

  const visitorsQuery = useQuery<VisitorInvite[]>({
    queryKey: ["visitors"],
    queryFn: () => apiRequest<VisitorInvite[]>("/resident/visitors", { limit: 100 }),
    enabled: enableVisitors,
  });

  const feedbacksQuery = useQuery<FeedbackItem[]>({
    queryKey: ["feedbacks"],
    queryFn: () => apiRequest<FeedbackItem[]>("/resident/feedback", { limit: 100 }),
    enabled: enableFeedbacks,
  });

  const notificationsQuery = useQuery<NotificationItem[]>({
    queryKey: ["notifications"],
    queryFn: () => apiRequest<NotificationItem[]>("/notifications", { limit: 50 }),
    enabled: enableNotifications,
  });

  // Mutations
  const votePollMutation = useMutation({
    mutationFn: (params: { pollId: string; optionId: string }) =>
      apiRequest(`/community/polls/${params.pollId}/vote`, { optionId: params.optionId }),
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
      queryClient.setQueryData<NotificationItem[]>(["notifications"], (old) => {
        if (!old) return [];
        return old.map((item) => (item.id === id ? { ...item, unread: false, read: true } : item));
      });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => apiRequest<{ markedRead: number }>("/notifications/mark-all-read", {}),
    onSuccess: () => {
      queryClient.setQueryData<NotificationItem[]>(["notifications"], (old) => {
        if (!old) return [];
        return old.map((item) => ({ ...item, unread: false, read: true }));
      });
    },
  });

  // States
  const updates = updatesQuery.data || [];
  const visitors = visitorsQuery.data || [];
  const feedbacks = feedbacksQuery.data || [];
  const notifications = notificationsQuery.data || [];
  
  const loading =
    updatesQuery.isLoading ||
    visitorsQuery.isLoading ||
    feedbacksQuery.isLoading ||
    notificationsQuery.isLoading ||
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

  const fetchUpdateDetails = React.useCallback(async (id: string) => {
    return await apiRequest<CommunityUpdate>(`/community/updates/${id}`, { lang: language });
  }, [language]);

  const votePoll = React.useCallback(async (pollId: string, optionId: string) => {
    await votePollMutation.mutateAsync({ pollId, optionId });
  }, [votePollMutation]);

  const fetchVisitors = React.useCallback(async () => {
    await visitorsQuery.refetch();
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

  const submitFeedback = React.useCallback(async (params: SubmitFeedbackParams) => {
    return await submitFeedbackMutation.mutateAsync(params);
  }, [submitFeedbackMutation]);

  const fetchNotifications = React.useCallback(async () => {
    await notificationsQuery.refetch();
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
    fetchUpdateDetails,
    votePoll,
    fetchVisitors,
    createVisitor,
    cancelVisitor,
    fetchFeedbacks,
    submitFeedback,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearError,
  };
}
