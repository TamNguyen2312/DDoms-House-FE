interface PropertyAmenitiesProps {
  amenities: Array<{
    name: string;
    icon: string;
  }>;
}

export default function PropertyAmenities({
  amenities,
}: PropertyAmenitiesProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {amenities.map((amenity, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 bg-muted rounded-lg border"
        >
          <span className="text-2xl">{amenity.icon}</span>
          <span className="font-medium text-sm">{amenity.name}</span>
        </div>
      ))}
    </div>
  );
}
