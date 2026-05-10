import AdminDashboard from "@/pages/AdminDashboard";
import AdminShop from "@/pages/AdminShop";
import AdminPremium from "@/pages/AdminPremium";
import AdminRewards from "@/pages/AdminRewards";
import AdminAchievements from "@/pages/AdminAchievements";

export const adminRoutes = [
  { path: "/admin", component: AdminDashboard },
  { path: "/admin/shop", component: AdminShop },
  { path: "/admin/premium", component: AdminPremium },
  { path: "/admin/rewards", component: AdminRewards },
  { path: "/admin/achievements", component: AdminAchievements },
] as const;
