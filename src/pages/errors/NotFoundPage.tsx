// // src/pages/errors/NotFoundPage.tsx
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, Home } from "lucide-react";
// import { Link } from "react-router-dom";

// export function NotFoundPage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background">
//       <div className="text-center space-y-6 px-4">
//         <div className="space-y-2">
//           <h1 className="text-9xl font-bold text-primary">404</h1>
//           <h2 className="text-3xl font-semibold">Không tìm thấy trang</h2>
//           <p className="text-muted-foreground max-w-md mx-auto">
//             Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
//           </p>
//         </div>

//         <div className="flex items-center justify-center gap-4">
//           <Button onClick={() => window.history.back()} variant="outline">
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Quay lại
//           </Button>
//           <Button asChild>
//             <Link to="/">
//               <Home className="mr-2 h-4 w-4" />
//               Trang chủ
//             </Link>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // src/pages/errors/UnauthorizedPage.tsx
// import { useAuth } from "@/store";
// import { ShieldAlert } from "lucide-react";

// export function UnauthorizedPage() {
//   const { user } = useAuth();

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background">
//       <div className="text-center space-y-6 px-4">
//         <div className="flex justify-center">
//           <div className="rounded-full bg-destructive/10 p-6">
//             <ShieldAlert className="h-24 w-24 text-destructive" />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <h1 className="text-4xl font-bold">Không có quyền truy cập</h1>
//           <p className="text-muted-foreground max-w-md mx-auto">
//             Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị
//             viên nếu bạn cho rằng đây là lỗi.
//           </p>
//         </div>

//         <div className="flex items-center justify-center gap-4">
//           <Button onClick={() => window.history.back()} variant="outline">
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Quay lại
//           </Button>
//           <Button asChild>
//             <Link to={user ? `/${user.role}` : "/"}>
//               <Home className="mr-2 h-4 w-4" />
//               {user ? "Dashboard" : "Trang chủ"}
//             </Link>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // src/pages/errors/ServerErrorPage.tsx
// import { RefreshCw, ServerCrash } from "lucide-react";

// export function ServerErrorPage() {
//   const handleRefresh = () => {
//     window.location.reload();
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background">
//       <div className="text-center space-y-6 px-4">
//         <div className="flex justify-center">
//           <div className="rounded-full bg-destructive/10 p-6">
//             <ServerCrash className="h-24 w-24 text-destructive" />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <h1 className="text-4xl font-bold">Lỗi máy chủ</h1>
//           <p className="text-muted-foreground max-w-md mx-auto">
//             Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng thử lại sau ít phút.
//           </p>
//         </div>

//         <div className="flex items-center justify-center gap-4">
//           <Button onClick={handleRefresh} variant="outline">
//             <RefreshCw className="mr-2 h-4 w-4" />
//             Thử lại
//           </Button>
//           <Button asChild>
//             <Link to="/">
//               <Home className="mr-2 h-4 w-4" />
//               Trang chủ
//             </Link>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

const NotFoundPage = () => {
  return <div>NotFoundPage</div>;
};

export default NotFoundPage;
