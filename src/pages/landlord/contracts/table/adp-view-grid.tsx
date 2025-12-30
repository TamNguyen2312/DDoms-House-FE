import PropertyCard from "@/components/common/property/PropertyCard";
import type { IContract } from "@/lib/dbContracts";
import type { Table } from "@tanstack/react-table";
import React from "react";

interface ADPViewGridProps {
  table: Table<IContract>;
  actions?: (row: IContract) => React.ReactNode;
}

export function ADPViewGrid({ table, actions }: ADPViewGridProps) {
  const rows = table.getRowModel().rows;

  if (!rows || rows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        Không tìm thấy kết quả phù hợp với tìm kiếm.
      </div>
    );
  }

  // const [viewPartner, setViewPartner] = useState<IContract | null>(null);
  // const handleViewPartner = (partner: IContract) => {
  //   setViewPartner(partner);
  // };

  return (
    <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 md:grid-cols-3">
      {rows.map((row) => {
        const data = row.original;
        return (
          <PropertyCard
          // key={partner.id}
          // partner={data}
          // className="rounded-lg"
          // actions={actions}
          // onClick={() => handleViewPartner(partner)}
          />
        );
      })}

      {/* Dialog xem chi tiết đối tác */}
      {/* {viewPartner && (
        <OwnerDetailsDialog
          partner={viewPartner}
          open={!!viewPartner}
          onOpenChange={(open) => !open && setViewPartner(null)}
        />
      )} */}
    </div>
  );
}
