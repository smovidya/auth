import { Welcome } from '~/welcome/welcome';
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ระบบจัดการการยืนยันตัวตน สโมสรนิสิตคณะวิทยาศาสตร์" },
    { name: "description", content: "ระบบจัดการข้อมูลนิสิตและการยืนยันตัวตนสำหรับระบบของสโมสรนิสิตคณะวิทยาศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "theme-color", content: "#ffffff" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "og:title", content: "ระบบจัดการการยืนยันตัวตน สโมสรนิสิตคณะวิทยาศาสตร์" },
    { name: "og:description", content: "ระบบจัดการข้อมูลนิสิตและการยืนยันตัวตนสำหรับระบบของสโมสรนิสิตคณะวิทยาศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย" },
    { name: "og:type", content: "website" },
    { name: "og:url", content: "https://auth.smovidya-chula.workers.dev/" },
    { name: "og:image", content: "/images/logo.png" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export default function Home() {
  return <Welcome />;
}
