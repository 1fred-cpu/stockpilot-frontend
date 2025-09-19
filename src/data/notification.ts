export interface NotificationUser {
  id: string;
  name: string;
  initials?: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  user: NotificationUser;
  action: string;
  project: string;
  message?: string;
  timestamp: string;
  isRead: boolean;
  createdAt: Date;
}

export const mockNotifications: Notification[] = [
  {
    id: "1",
    user: {
      id: "john-doe",
      name: "John Doe",
      initials: "JD",
    },
    action: "mentioned you in a project",
    project: "Client onboarding process",
    message:
      "@Jane smith can we get an update about this? We need to complete this before June 25th",
    timestamp: "2 mins ago",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "2",
    user: {
      id: "emily-clark",
      name: "Emily Clark",
      initials: "EC",
    },
    action: "assigned you in a project",
    project: "Create a marketing plan for project alpha",
    timestamp: "1 day ago",
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    user: {
      id: "michael-roberts",
      name: "Michael Roberts",
      initials: "MR",
    },
    action: "assigned you in a project",
    project: "Product launch coordination",
    timestamp: "Last week",
    isRead: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    user: {
      id: "michael-roberts-2",
      name: "Michael Roberts",
      initials: "MR",
    },
    action: "mentioned you in a project",
    project: "Product launch",
    timestamp: "Last week",
    isRead: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
];
