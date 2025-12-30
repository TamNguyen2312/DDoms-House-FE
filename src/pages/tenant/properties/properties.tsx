import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dbFavorites } from "@/lib/dbFavorites";
import { formatVietnamMoney } from "@/utils/formatters";
import { formatDate } from "date-fns";
import { Bed, Calendar, Eye, Heart, Search, Square, X } from "lucide-react";

const Property = () => {
  return (
    <div className="min-h-screen from-blue-50 to-indigo-50">
      <div className=" mx-auto">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Phòng Đã Thuê
          </h1>
          <p className="text-gray-600">Quản lý các phòng bạn đang thuê</p>
        </div>

        <div className="grid md:grid-cols-4 gap-2">
          {dbFavorites.map((fav) => (
            <Card
              key={fav.id}
              className="hover:shadow-xl transition-all duration-300 border py-2"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold group-hover:text-primary transition-colors">
                        {fav.listing.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {formatVietnamMoney(fav.listing.price)}/ tháng
                      {fav.listing.unit.property.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {fav.listing.unit.property.district}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 mb-4 p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-rose-600" />
                    <span className="font-medium">
                      {fav.listing.unit.bedrooms} PN
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5 text-rose-600" />
                    <span className="font-medium">
                      {fav.listing.unit.area_sq_m}m²
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Đã lưu: {formatDate(fav.created_at, "dd/mm/yyyy")}
                </p>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    Đặt lịch
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {dbFavorites.length === 0 && (
          <div className="text-center py-20">
            <Heart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              Chưa có phòng yêu thích
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy khám phá và lưu những phòng bạn thích
            </p>
            <Button size="lg">
              <Search className="w-5 h-5 mr-2" />
              Tìm phòng ngay
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Property;
