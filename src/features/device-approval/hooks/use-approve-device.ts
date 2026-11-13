import { useMutation } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import { approveDevice } from "../api/device-approval.api";

export const useApproveDevice = () =>
  useMutation({
    mutationFn: approveDevice,
    onSuccess: () => notifySuccess("Device approved", "Return to your terminal"),
    onError: (e) => notifyError(e),
  });
