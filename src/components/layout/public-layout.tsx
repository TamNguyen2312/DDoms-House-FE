import { Outlet } from "react-router-dom";
import { FloatingChatButton } from "../chat/floating-chat-button";
import Footer from "./Footer/footer";
import Header from "./Header/header";

const PublicLayout = () => {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingChatButton />
    </div>
  );
};

export default PublicLayout;
