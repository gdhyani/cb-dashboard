import { useMutation } from "@tanstack/react-query";
import { notifyError } from "@/shared/lib/notify";
import { approveDevice } from "../api/device-approval.api";

export const useApproveDevice = () => useMutation({ mutationFn: approveDevice, onError: (e) => notifyError(e) });
