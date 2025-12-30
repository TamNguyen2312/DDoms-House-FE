import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type {
  IContractDetailResponse,
} from "@/pages/landlord/contracts/types";

// Khởi tạo pdfMake với fonts
// vfs_fonts export trực tiếp vfs object
(pdfMake as any).vfs = pdfFonts;

/**
 * Format số tiền theo định dạng Việt Nam
 */
const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format ngày tháng theo định dạng Việt Nam
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Tính số tháng giữa 2 ngày
 */
const calculateMonths = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  return years * 12 + months + 1; // +1 để tính cả tháng đầu
};

/**
 * Generate PDF hợp đồng cho thuê nhà tại Việt Nam
 */
export const generateContractPDF = (
  contractDetail: IContractDetailResponse,
  landlordProfile?: any,
  tenantProfile?: any
): void => {
  const { contract, parties, signatures } = contractDetail;

  const landlord = parties.find((p) => p.role === "LANDLORD");
  const tenant = parties.find((p) => p.role === "TENANT");

  const landlordName =
    landlordProfile?.landlordProfile?.displayName ||
    contract.landlord?.displayName ||
    landlord?.email ||
    "Chưa cập nhật";
  const tenantName =
    tenantProfile?.tenantProfile?.fullName ||
    contract.tenant?.displayName ||
    tenant?.email ||
    "Chưa cập nhật";

  const landlordPhone = landlord?.phone || contract.landlord?.phone || "";
  const tenantPhone = tenant?.phone || contract.tenant?.phone || "";

  const landlordEmail = landlord?.email || contract.landlord?.email || "";
  const tenantEmail = tenant?.email || contract.tenant?.email || "";

  const unit = contract.unit;
  const address = unit
    ? `${unit.addressLine}${unit.ward ? `, ${unit.ward}` : ""}${
        unit.district ? `, ${unit.district}` : ""
      }${unit.city ? `, ${unit.city}` : ""}`
    : "Chưa cập nhật";

  const contractMonths = calculateMonths(contract.startDate, contract.endDate);
  const today = new Date();

  // Định nghĩa nội dung PDF
  const docDefinition: any = {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    defaultStyle: {
      font: "Roboto",
      fontSize: 11,
      lineHeight: 1.5,
    },
    content: [
      // Tiêu đề
      {
        text: "HỢP ĐỒNG CHO THUÊ NHÀ",
        style: "title",
        alignment: "center",
        margin: [0, 0, 0, 5],
      },
      {
        text: "(Về việc cho thuê nhà ở)",
        style: "subtitle",
        alignment: "center",
        margin: [0, 0, 0, 20],
      },
      // Thông tin hợp đồng
      {
        text: `Số hợp đồng: ${contract.id}`,
        margin: [0, 0, 0, 5],
      },
      {
        text: `Ngày lập: ${formatDate(today.toISOString())}`,
        margin: [0, 0, 0, 20],
      },
      // Căn cứ pháp lý
      {
        text: "CĂN CỨ PHÁP LÝ:",
        style: "heading",
        margin: [0, 0, 0, 7],
      },
      {
        ul: [
          "Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;",
          "Căn cứ Luật Nhà ở số 65/2014/QH13 ngày 25/11/2014;",
          "Căn cứ vào nhu cầu và khả năng của các bên;",
          "Hai bên thống nhất ký kết hợp đồng cho thuê nhà với các điều khoản sau:",
        ],
        margin: [10, 0, 0, 20],
      },
      // Điều 1: Các bên tham gia
      {
        text: "ĐIỀU 1: CÁC BÊN THAM GIA HỢP ĐỒNG",
        style: "heading",
        margin: [0, 0, 0, 7],
      },
      {
        text: "BÊN CHO THUÊ (BÊN A):",
        style: "subheading",
        margin: [0, 0, 0, 7],
      },
      {
        ul: [
          `Họ và tên: ${landlordName}`,
          `Số điện thoại: ${landlordPhone || "Chưa cập nhật"}`,
          `Email: ${landlordEmail || "Chưa cập nhật"}`,
        ],
        margin: [10, 0, 0, 10],
      },
      {
        text: "BÊN THUÊ (BÊN B):",
        style: "subheading",
        margin: [0, 0, 0, 7],
      },
      {
        ul: [
          `Họ và tên: ${tenantName}`,
          `Số điện thoại: ${tenantPhone || "Chưa cập nhật"}`,
          `Email: ${tenantEmail || "Chưa cập nhật"}`,
        ],
        margin: [10, 0, 0, 20],
      },
      // Điều 2: Đối tượng và địa điểm cho thuê
      {
        text: "ĐIỀU 2: ĐỐI TƯỢNG VÀ ĐỊA ĐIỂM CHO THUÊ",
        style: "heading",
        margin: [0, 0, 0, 7],
      },
      {
        ul: [
          {
            text: [
              "Bên A đồng ý cho Bên B thuê nhà với các thông tin sau:",
              "\n   - Mã phòng: ",
              { text: unit?.unitCode || "Chưa cập nhật", bold: true },
              "\n   - Tên tòa nhà: ",
              { text: unit?.propertyName || "Chưa cập nhật", bold: true },
              "\n   - Địa chỉ: ",
              { text: address, bold: true },
            ],
          },
          "Bên B đồng ý thuê và sử dụng nhà theo đúng mục đích đã thỏa thuận.",
        ],
        margin: [10, 0, 0, 20],
      },
      // Điều 3: Thời hạn hợp đồng
      {
        text: "ĐIỀU 3: THỜI HẠN HỢP ĐỒNG",
        style: "heading",
        margin: [0, 0, 0, 7],
      },
      {
        ul: [
          `Thời hạn cho thuê: ${contractMonths} tháng`,
          `Thời gian bắt đầu: Từ ngày ${formatDate(contract.startDate)}`,
          `Thời gian kết thúc: Đến ngày ${formatDate(contract.endDate)}`,
          "Hợp đồng có thể được gia hạn hoặc chấm dứt theo thỏa thuận của hai bên.",
        ],
        margin: [10, 0, 0, 20],
      },
      // Điều 4: Giá thuê và phương thức thanh toán
      {
        text: "ĐIỀU 4: GIÁ THUÊ VÀ PHƯƠNG THỨC THANH TOÁN",
        style: "heading",
        margin: [0, 0, 0, 7],
      },
      {
        ul: [
          `Giá thuê nhà: ${formatMoney(contract.depositAmount)}/tháng`,
          `Tiền đặt cọc: ${formatMoney(contract.depositAmount)}`,
          "Phương thức thanh toán: Thanh toán hàng tháng",
          "Thời hạn thanh toán: Trước ngày 05 hàng tháng",
          ...(contract.feeDetail
            ? [
                {
                  text: [
                    "Chi tiết các loại phí:",
                    ...contract.feeDetail
                      .split("\n")
                      .filter((line) => line.trim())
                      .map((line) => [
                        "\n   ",
                        { text: line.trim(), fontSize: 10 },
                      ])
                      .flat(),
                  ],
                },
              ]
            : []),
        ],
        margin: [10, 0, 0, 20],
      },
      // Điều 5: Quyền và nghĩa vụ
      {
        text: "ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN",
        style: "heading",
        margin: [0, 0, 0, 7],
      },
      {
        text: "5.1. Quyền và nghĩa vụ của Bên A (Bên cho thuê):",
        style: "subheading",
        margin: [0, 0, 0, 7],
      },
      {
        ul: [
          "Giao nhà cho Bên B đúng thời hạn và đúng tình trạng như đã thỏa thuận;",
          "Bảo đảm quyền sử dụng nhà cho Bên B trong thời hạn hợp đồng;",
          "Sửa chữa nhà khi có hư hỏng do lỗi của Bên A hoặc do hao mòn tự nhiên;",
          "Nhận tiền thuê nhà đúng thời hạn và đúng số tiền đã thỏa thuận;",
          "Yêu cầu Bên B trả lại nhà khi hết hạn hợp đồng hoặc khi chấm dứt hợp đồng.",
        ],
        margin: [10, 0, 0, 10],
      },
      {
        text: "5.2. Quyền và nghĩa vụ của Bên B (Bên thuê):",
        style: "subheading",
        margin: [0, 0, 0, 7],
      },
      {
        ul: [
          "Sử dụng nhà đúng mục đích, đúng thỏa thuận;",
          "Trả tiền thuê nhà đúng thời hạn và đúng số tiền đã thỏa thuận;",
          "Bảo quản nhà, giữ gìn vệ sinh, không được tự ý sửa chữa, cải tạo nhà;",
          "Trả lại nhà đúng tình trạng ban đầu khi hết hạn hợp đồng;",
          "Chịu trách nhiệm về các thiệt hại do lỗi của mình gây ra.",
        ],
        margin: [10, 0, 0, 20],
      },
      // Điều 6: Điều khoản chung
      {
        text: "ĐIỀU 6: ĐIỀU KHOẢN CHUNG",
        style: "heading",
        margin: [0, 0, 0, 7],
      },
      {
        ul: [
          "Hợp đồng này có hiệu lực kể từ ngày ký và được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.",
          "Trong quá trình thực hiện hợp đồng, nếu có vấn đề phát sinh, hai bên sẽ cùng nhau thương lượng giải quyết trên tinh thần hợp tác.",
          "Mọi sửa đổi, bổ sung hợp đồng phải được lập thành văn bản và có chữ ký của cả hai bên.",
          "Hợp đồng này chấm dứt khi hết thời hạn hoặc khi một trong hai bên vi phạm nghiêm trọng các điều khoản đã thỏa thuận.",
        ],
        margin: [10, 0, 0, 30],
      },
      // Chữ ký
      {
        columns: [
          {
            text: [
              { text: "ĐẠI DIỆN BÊN CHO THUÊ", bold: true },
              "\n\n\n\n",
              { text: "(Ký và ghi rõ họ tên)", fontSize: 10 },
            ],
            alignment: "center",
          },
          {
            text: [
              { text: "ĐẠI DIỆN BÊN THUÊ", bold: true },
              "\n\n\n\n",
              { text: "(Ký và ghi rõ họ tên)", fontSize: 10 },
            ],
            alignment: "center",
          },
        ],
        margin: [0, 0, 0, 20],
      },
      // Thông tin chữ ký điện tử nếu có
      ...(signatures.length > 0
        ? [
            {
              text: "Đã ký điện tử:",
              fontSize: 10,
              margin: [0, 20, 0, 5],
            },
            {
              ul: signatures
                .map((sig) => {
                  const party = parties.find((p) => p.id === sig.partyId);
                  if (party && sig.signedAt) {
                    const role =
                      party.role === "LANDLORD" ? "Bên cho thuê" : "Bên thuê";
                    return `${role}: ${formatDate(sig.signedAt)}`;
                  }
                  return null;
                })
                .filter((item) => item !== null),
              fontSize: 10,
              margin: [10, 0, 0, 0],
            },
          ]
        : []),
    ],
    styles: {
      title: {
        fontSize: 16,
        bold: true,
        alignment: "center",
      },
      subtitle: {
        fontSize: 11,
        alignment: "center",
      },
      heading: {
        fontSize: 12,
        bold: true,
      },
      subheading: {
        fontSize: 11,
        bold: true,
      },
    },
  };

  // Tạo và tải PDF
  const fileName = `Hop-dong-${contract.id}-${formatDate(contract.startDate)}.pdf`;
  pdfMake.createPdf(docDefinition).download(fileName);
};
