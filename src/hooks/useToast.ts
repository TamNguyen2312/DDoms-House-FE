// src/hooks/useToast.ts
import { toast as sonnerToast } from "sonner";

export interface ToastOptions {
  duration?: number;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

export function useToast() {
  /**
   * Show success toast
   */
  const success = (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      duration: options?.duration || 3000,
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Show error toast
   */
  const error = (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: options?.duration || 4000,
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Show warning toast
   */
  const warning = (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      duration: options?.duration || 3500,
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Show info toast
   */
  const info = (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      duration: options?.duration || 3000,
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Show loading toast
   */
  const loading = (
    message: string,
    options?: Omit<ToastOptions, "duration">
  ) => {
    return sonnerToast.loading(message, {
      description: options?.description,
    });
  };

  /**
   * Show promise toast (automatic success/error based on promise result)
   */
  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: (data) => {
        return typeof messages.success === "function"
          ? messages.success(data)
          : messages.success;
      },
      error: (error) => {
        return typeof messages.error === "function"
          ? messages.error(error)
          : messages.error;
      },
      duration: options?.duration,
      description: options?.description,
    });
  };

  /**
   * Show custom toast with JSX content
   */
  const custom = (content: React.ReactNode, options?: ToastOptions) => {
    return sonnerToast.custom(content, {
      duration: options?.duration || 3000,
      onDismiss: options?.onDismiss,
      onAutoClose: options?.onAutoClose,
    });
  };

  /**
   * Dismiss a specific toast
   */
  const dismiss = (toastId?: string | number) => {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    } else {
      sonnerToast.dismiss();
    }
  };

  /**
   * Dismiss all toasts
   */
  const dismissAll = () => {
    sonnerToast.dismiss();
  };

  // Predefined toast messages
  const predefined = {
    // Auth messages
    loginSuccess: () => success("Đăng nhập thành công!"),
    loginError: () =>
      error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."),
    logoutSuccess: () => success("Đã đăng xuất"),
    registerSuccess: () => success("Đăng ký thành công!"),
    registerError: () =>
      error("Đăng ký thất bại. Email có thể đã được sử dụng."),

    // Property messages
    propertyCreated: () => success("Tạo phòng thành công!"),
    propertyUpdated: () => success("Cập nhật phòng thành công!"),
    propertyDeleted: () => success("Xóa phòng thành công!"),
    propertyError: () => error("Có lỗi xảy ra khi xử lý phòng"),

    // Contract messages
    contractCreated: () => success("Tạo hợp đồng thành công!"),
    contractUpdated: () => success("Cập nhật hợp đồng thành công!"),
    contractDeleted: () => success("Xóa hợp đồng thành công!"),
    contractError: () => error("Có lỗi xảy ra khi xử lý hợp đồng"),

    // Invoice messages
    invoiceCreated: () => success("Tạo thanh toán thành công!"),
    invoiceUpdated: () => success("Cập nhật hóa đơn thành công!"),
    invoicePaid: () => success("Đã xác nhận thanh toán!"),
    invoiceError: () => error("Có lỗi xảy ra khi xử lý hóa đơn"),

    // Upload messages
    uploadSuccess: (count: number = 1) =>
      success(`Upload thành công ${count} file!`),
    uploadError: () => error("Upload thất bại. Vui lòng thử lại."),
    fileTooLarge: (maxSize: string = "5MB") =>
      error(`File quá lớn. Kích thước tối đa: ${maxSize}`),
    invalidFileType: () => error("Định dạng file không hợp lệ"),

    // General messages
    saveSuccess: () => success("Lưu thành công!"),
    saveError: () => error("Lưu thất bại. Vui lòng thử lại."),
    deleteConfirm: (itemName: string = "mục này") =>
      warning(`Bạn có chắc muốn xóa ${itemName}?`),
    networkError: () => error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối."),
    unauthorized: () => error("Bạn không có quyền thực hiện hành động này"),
    notFound: () => error("Không tìm thấy dữ liệu"),

    // Validation messages
    requiredField: (fieldName: string) => error(`${fieldName} là bắt buộc`),
    invalidEmail: () => error("Email không hợp lệ"),
    invalidPhone: () => error("Số điện thoại không hợp lệ"),
    passwordTooShort: (minLength: number = 6) =>
      error(`Mật khẩu phải có ít nhất ${minLength} ký tự`),
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    custom,
    dismiss,
    dismissAll,
    predefined,
  };
}

// Usage Examples:
/*
// 1. Basic usage
function LoginForm() {
  const toast = useToast();

  const handleLogin = async () => {
    try {
      await login(credentials);
      toast.success('Đăng nhập thành công!');
    } catch (error) {
      toast.error('Đăng nhập thất bại');
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}

// 2. With description
function CreateProperty() {
  const toast = useToast();

  const handleCreate = async () => {
    toast.success('Tạo phòng thành công!', {
      description: 'Phòng của bạn đang chờ admin duyệt',
      duration: 5000,
    });
  };
}

// 3. With action button
function DeleteProperty() {
  const toast = useToast();

  const handleDelete = async (id: string) => {
    toast.warning('Phòng đã được xóa', {
      action: {
        label: 'Hoàn tác',
        onClick: () => restoreProperty(id),
      },
      duration: 5000,
    });
  };
}

// 4. Loading toast
function UploadImages() {
  const toast = useToast();

  const handleUpload = async (files: File[]) => {
    const toastId = toast.loading('Đang upload ảnh...');
    
    try {
      await uploadImages(files);
      toast.dismiss(toastId);
      toast.success('Upload thành công!');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Upload thất bại');
    }
  };
}

// 5. Promise toast (auto success/error)
function SaveData() {
  const toast = useToast();

  const handleSave = async () => {
    toast.promise(
      saveDataToServer(),
      {
        loading: 'Đang lưu...',
        success: 'Lưu thành công!',
        error: 'Lưu thất bại',
      }
    );
  };
}

// 6. Promise toast with dynamic messages
function ProcessPayment() {
  const toast = useToast();

  const handlePayment = async () => {
    toast.promise(
      processPayment(amount),
      {
        loading: 'Đang xử lý thanh toán...',
        success: (data) => `Thanh toán thành công ${data.amount.toLocaleString()}đ`,
        error: (error) => error.message || 'Thanh toán thất bại',
      }
    );
  };
}

// 7. Custom toast with JSX
function CustomNotification() {
  const toast = useToast();

  const showCustom = () => {
    toast.custom(
      <div className="flex items-center gap-3 p-4 bg-primary text-white rounded-lg">
        <img src="/icon.png" alt="icon" className="w-10 h-10" />
        <div>
          <h3 className="font-bold">Thông báo mới</h3>
          <p className="text-sm">Bạn có hợp đồng sắp hết hạn</p>
        </div>
      </div>,
      { duration: 5000 }
    );
  };
}

// 8. Using predefined messages
function QuickActions() {
  const toast = useToast();

  const handleLogin = async () => {
    try {
      await login();
      toast.predefined.loginSuccess();
    } catch (error) {
      toast.predefined.loginError();
    }
  };

  const handleUpload = async (files: File[]) => {
    try {
      await upload(files);
      toast.predefined.uploadSuccess(files.length);
    } catch (error) {
      toast.predefined.uploadError();
    }
  };

  const handleDelete = () => {
    toast.predefined.deleteConfirm('phòng này');
  };
}

// 9. Dismiss specific toast
function MultipleToasts() {
  const toast = useToast();

  const showMultiple = () => {
    const id1 = toast.info('Toast 1');
    const id2 = toast.info('Toast 2');
    const id3 = toast.info('Toast 3');

    // Dismiss specific toast after 2 seconds
    setTimeout(() => {
      toast.dismiss(id2);
    }, 2000);
  };
}

// 10. Dismiss all toasts
function DismissAll() {
  const toast = useToast();

  const clearAll = () => {
    toast.dismissAll();
  };

  return <button onClick={clearAll}>Clear All Notifications</button>;
}

// 11. Toast with cancel button
function ConfirmAction() {
  const toast = useToast();

  const handleAction = () => {
    let cancelled = false;

    toast.warning('Hành động sẽ được thực hiện sau 5 giây', {
      duration: 5000,
      cancel: {
        label: 'Hủy',
        onClick: () => {
          cancelled = true;
          toast.info('Đã hủy hành động');
        },
      },
      onAutoClose: () => {
        if (!cancelled) {
          performAction();
        }
      },
    });
  };
}

// 12. Integration with forms
function PropertyForm() {
  const toast = useToast();
  const form = useForm(schema);

  const onSubmit = async (data: PropertyFormData) => {
    const toastId = toast.loading('Đang tạo phòng...');

    try {
      await createProperty(data);
      toast.dismiss(toastId);
      toast.success('Tạo phòng thành công!', {
        description: 'Phòng đang chờ admin duyệt',
        action: {
          label: 'Xem phòng',
          onClick: () => navigate(`/properties/${propertyId}`),
        },
      });
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Tạo phòng thất bại', {
        description: error.message,
      });
    }
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}

// 13. File validation with toast
function FileUpload() {
  const toast = useToast();

  const handleFileChange = (files: File[]) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (file.size > maxSize) {
        toast.predefined.fileTooLarge('5MB');
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.predefined.invalidFileType();
        return;
      }
    }

    // Upload files
    uploadFiles(files);
  };
}

// 14. Network error handling
function DataFetcher() {
  const toast = useToast();

  const fetchData = async () => {
    try {
      const data = await api.getData();
      return data;
    } catch (error) {
      if (error.code === 'NETWORK_ERROR') {
        toast.predefined.networkError();
      } else if (error.status === 401) {
        toast.predefined.unauthorized();
      } else if (error.status === 404) {
        toast.predefined.notFound();
      } else {
        toast.error('Có lỗi xảy ra');
      }
    }
  };
}

// 15. Async operation with progress
function BatchOperation() {
  const toast = useToast();

  const processBatch = async (items: any[]) => {
    const toastId = toast.loading(`Đang xử lý 0/${items.length} mục...`);
    
    for (let i = 0; i < items.length; i++) {
      await processItem(items[i]);
      toast.dismiss(toastId);
      toast.loading(`Đang xử lý ${i + 1}/${items.length} mục...`);
    }

    toast.dismiss(toastId);
    toast.success(`Đã xử lý thành công ${items.length} mục!`);
  };
}
*/
