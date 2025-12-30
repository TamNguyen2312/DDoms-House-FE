import {
  CirclePlus,
  HardDriveDownload,
  HardDriveUpload,
  MessageCircleWarning,
  Printer,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useState, type JSX } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import {
  SitePageActions,
  SitePageHeader,
  SitePageHeaderDescription,
  SitePageHeaderHeading,
} from "./site-page-header";

interface SitePageTitleProps<
  TCreateArg = void,
  TPrintArg = void,
  TExportArg = void,
  TImportArg = void
> {
  title?: string;
  subTitle?: string;
  announ?: { iconAnnoun?: LucideIcon; hrefAnnoun: string; contAnnoun: string };
  hideCreate?: boolean;
  hidePrint?: boolean;
  hideImport?: boolean;
  hideExport?: boolean;
  onCreate?: (arg: TCreateArg) => void;
  onPrint?: (arg: TPrintArg) => void;
  onExport?: (arg: TExportArg) => void;
  onImport?: (arg: TImportArg) => void;
  titleCreate?: string;
  titleImport?: string;
  titlePrint?: string;
  titleExport?: string;
}

const SitePageTitle = <
  TCreateArg = void,
  TPrintArg = void,
  TExportArg = void,
  TImportArg = void
>({
  title = "Tổng Quan",
  subTitle = "Tổng quan.",
  hideCreate = false,
  hidePrint = false,
  hideExport = false,
  hideImport = false,
  onCreate,
  onPrint,
  onExport,
  onImport,
  titleCreate = "Tạo mới",
  titleImport = "Nhập dữ liệu",
  titlePrint = "In ấn",
  titleExport = "Xuất báo cáo",
}: SitePageTitleProps<
  TCreateArg,
  TPrintArg,
  TExportArg,
  TImportArg
>): JSX.Element => {
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const showTemporaryAlert = useCallback(() => {
    setShowAlert(true);
    const timer = setTimeout(() => setShowAlert(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const defaultOnCreate = useCallback(
    () => showTemporaryAlert(),
    [showTemporaryAlert]
  );
  const defaultOnPrint = useCallback(
    () => showTemporaryAlert(),
    [showTemporaryAlert]
  );
  const defaultOnExport = useCallback(
    () => showTemporaryAlert(),
    [showTemporaryAlert]
  );

  const handleCreate = useCallback(() => {
    if (onCreate) {
      onCreate(undefined as TCreateArg); // Không truyền tham số cụ thể ở đây
    } else {
      defaultOnCreate();
    }
  }, [onCreate, defaultOnCreate]);

  const handlePrint = useCallback(() => {
    if (onPrint) onPrint(undefined as TPrintArg);
    else defaultOnPrint();
  }, [onPrint, defaultOnPrint]);

  const handleExport = useCallback(() => {
    if (onExport) onExport(undefined as TExportArg);
    else defaultOnExport();
  }, [onExport, defaultOnExport]);

  const handleImport = useCallback(() => {
    if (onImport) onImport(undefined as TImportArg);
    else defaultOnExport();
  }, [onImport, defaultOnExport]);

  return (
    <>
      {showAlert && (
        <div className="mb-4">
          <Alert variant="destructive">
            <MessageCircleWarning className="size-4" />
            <AlertTitle>Cảnh báo</AlertTitle>
            <AlertDescription>
              Chức năng đang trong quá trình hoàn thiện.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <SitePageHeader>
        <div className="grid grid-cols-1 sm:grid-cols-10 gap-4 items-start w-full">
          <div className="sm:col-span-6">
            <SitePageHeaderHeading>{title}</SitePageHeaderHeading>
            <SitePageHeaderDescription>{subTitle}</SitePageHeaderDescription>
          </div>
          <div className="sm:col-span-4 h-full">
            <SitePageActions className="sm:col-span-4 h-full items-end flex-col sm:flex-row gap-2">
              {!hideCreate && onCreate && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full px-4 shadow-none transition-colors duration-200 sm:w-auto"
                  onClick={handleCreate}
                >
                  <CirclePlus size={20} strokeWidth={1.5} />
                  {titleCreate}
                </Button>
              )}
              {!hidePrint && onPrint && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full px-4 shadow-none transition-colors duration-200 sm:w-auto"
                  onClick={handlePrint}
                >
                  <Printer size={20} strokeWidth={1.5} />
                  {titlePrint}
                </Button>
              )}
              {!hideImport && onImport && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full px-4 shadow-none transition-colors duration-200 sm:w-auto"
                  onClick={handleImport}
                >
                  <HardDriveDownload size={20} strokeWidth={1.5} />
                  {titleImport}
                </Button>
              )}
              {!hideExport && onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full px-4 shadow-none transition-colors duration-200 sm:w-auto"
                  onClick={handleExport}
                >
                  <HardDriveUpload size={20} strokeWidth={1.5} />
                  {titleExport}
                </Button>
              )}
            </SitePageActions>
          </div>
        </div>
      </SitePageHeader>
    </>
  );
};

export default SitePageTitle;
