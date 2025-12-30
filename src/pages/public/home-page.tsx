import ListingsSection from "@/components/listing/listings-section";
import { useParams } from "react-router-dom";

const HomePage = () => {
  const param = useParams();
  const slug = param.slug;
  return (
    <div>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4">
          {slug}
          <ListingsSection />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
