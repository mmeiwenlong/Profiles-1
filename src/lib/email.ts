import nodemailer from "nodemailer";
import path from "path";
import fs from "fs/promises";
import envs from "../envs";

const transporter = nodemailer.createTransport({
    host: envs.value.email.smtp_host,
    port: Number(envs.value.email.smtp_port),
    secure: envs.value.email.smtp_secure === "true",
    auth: { user: envs.value.email.smtp_user, pass: envs.value.email.smtp_pass },
});

export async function sendEmail(filePath?: string, title?: string) {
    // 如果提供了附件
    let attachments: { filename: string; path: string }[] | undefined;
    if (filePath) {
        const stats = await fs.stat(filePath);
        const maxBytes = Number(envs.value.email.max_attach_mb ?? 24) * 1024 * 1024;
        if (stats.size > maxBytes) {
            throw new Error(
                `Attachment too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB > ${envs.value.email.max_attach_mb ?? 24}MB`
            );
        }
        attachments = [
            {
                filename: path.basename(filePath),
                path: filePath,
            },
        ];
    }

    const info = await transporter.sendMail({
        from: envs.value.email.mail_from,
        to: envs.value.email.mail_to,
        subject: title ?? (filePath ? path.basename(filePath) : "No Attachment"),
        text: "Sent by node-tasks",
        attachments,
    });

    return { ok: true, messageId: info.messageId };
}