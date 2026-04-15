import {
  BinaryTransferResultSchema,
  SuccessResponseSchema,
  TextInteropResultSchema,
} from "../../schemas/bridgeSchema";
import { invoke } from "../runtime";

export const interopBridge = {
  echoText: (message: string) =>
    invoke("EchoTextAsync", TextInteropResultSchema, [message]),
  echoBinary: (base64: string) =>
    invoke("EchoBinaryAsync", BinaryTransferResultSchema, [base64]),
  sendTextMessageToJs: (message: string) =>
    invoke("SendTextMessageToJsAsync", SuccessResponseSchema, [message]),
  sendBinaryMessageToJs: (byteLength = 32) =>
    invoke("SendBinaryMessageToJsAsync", SuccessResponseSchema, [byteLength]),
};
