# Pastel Portfolio

เว็บ 6 หน้า: index.html (Welcome เต็มจอ ไม่มีเมนู), contents.html (สารบัญแฟ้ม), profile.html (ประวัติส่วนตัว), education.html (การศึกษา), competitions.html (การแข่งขัน), activities.html (กิจกรรมและเกียรติบัตร)

หน้า Welcome มีปุ่ม “ชมผลงาน” เพื่อเข้าสู่สารบัญแฟ้มสีม่วง โดยมีเมนูทั้ง 4 หมวดเด้งออกรอบแฟ้ม กดแฟ้มเพื่อเปิด/ปิดเมนูได้ หน้าด้านในใช้ dropdown สำหรับเปลี่ยนหน้า และกลับสารบัญหรือ Welcome ได้ รูปที่ส่งมาถูกใส่ไว้ใน assets/cartoon-portrait.png และข้อมูลจากภาพเป็นค่าเริ่มต้นของเว็บ จะแสดงได้แม้ยังไม่ได้ตั้งค่าฐานข้อมูล เมื่อบันทึกจากบัญชีผู้ดูแล เว็บจะใช้ข้อมูลจาก Supabase แทน

## ตั้งค่า Supabase ครั้งแรก
1. Project URL และ Publishable key ที่คุณส่งมาถูกใส่ไว้ใน config.js แล้ว
2. เปิด SQL Editor ของโปรเจกต์ และรัน supabase-setup.sql หนึ่งครั้ง หากเคยรันไฟล์เก่าก่อนเพิ่มหน้าประวัติแล้ว ให้รัน supabase-profile-update.sql เพื่อเพิ่มช่องข้อมูลใหม่
3. ไปที่ Authentication > Users > Add user สร้างบัญชีอีเมลและรหัสผ่านของผู้ดูแล
4. คัดลอก UUID ของผู้ใช้ แล้วรันคำสั่งท้ายไฟล์ SQL โดยแทน YOUR_ADMIN_USER_UUID ด้วย UUID นั้น
5. เข้าหน้าประวัติส่วนตัว กดไอคอนผู้ดูแลด้านบน แล้วเข้าสู่ระบบด้วยบัญชีที่สร้างไว้

ผู้ดูแลเพิ่ม/แก้ไข/ลบข้อมูลได้ทุกหน้า และใส่ข้อมูลส่วนตัวกับรูปบนป้ายได้ ส่วนผู้ชมอ่านข้อมูลได้อย่างเดียว ไม่มีการสมัครผู้ดูแลจากหน้าเว็บ

รูปกิจกรรมและการแข่งขันรองรับ JPG, PNG, WebP; เกียรติบัตรรองรับรูปหรือ PDF สูงสุด 10 MB ต่อไฟล์ ป้ายส่วนตัวใช้รูปสูงสุด 10 MB

ข้อมูลที่บันทึกจากบัญชีผู้ดูแลและรูปที่อัปโหลดเก็บบน Supabase ทุกเครื่องเห็นข้อมูลเดียวกัน ส่วนรูปเริ่มต้นอยู่ในโฟลเดอร์ assets ของเว็บ เสียงคลิกเปิด/ปิดได้และจดจำค่าในเบราว์เซอร์ ไม่เล่นเสียงก่อนผู้ใช้กด

ไฟล์ใน bucket pastel-portfolio-media เป็นสาธารณะ เพราะใช้แสดงบนพอร์ต จึงควรปิดข้อมูลส่วนตัวบนเกียรติบัตรก่อนอัปโหลด

เปิดไฟล์ HTML ได้โดยตรงหากเบราว์เซอร์รองรับ Supabase บน file URL หากเข้าสู่ระบบติดข้อจำกัดของเบราว์เซอร์ ให้เปิดผ่าน static HTTP server หรือโฮสต์ static website

## ไฟล์
- styles.css: สี เลย์เอาต์ มือถือ และสายคล้องป้าย
- experience.css: Welcome เต็มจอ แฟ้มสารบัญ และ dropdown
- interactions.css: เส้นทางการศึกษา รูปพลิก แท็บประวัติ และรายการผลงาน
- app.js: หน้าเว็บ เสียงคลิก ฟอร์มผู้ดูแล และ Supabase
- config.js: ค่าเชื่อมต่อที่เปิดเผยต่อเบราว์เซอร์ได้ ไม่มี service_role key
- supabase-setup.sql: ตาราง RLS และ Storage

เมื่อฐานข้อมูลยังไม่พร้อม หน้าเว็บจะแสดงสถานะจริงและช่องว่างข้อมูล ไม่มีข้อมูลรางวัลหรือโรงเรียนสมมติ

อ้างอิงการเชื่อมต่อ: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control)

## ข้อมูลการศึกษาและลูกเล่น
ข้อมูลการศึกษาทั้ง 4 ระดับตามภาพจะแสดงได้ทันทีเมื่อยังไม่มีรายการการศึกษาในฐานข้อมูล พร้อมโลโก้จากภาพต้นฉบับ หากต้องการบันทึกให้แก้ไขได้บน Supabase ให้เข้าสู่บัญชีผู้ดูแลและกด “บันทึกประวัติการศึกษา” หรือรัน supabase-education-data.sql หลังไฟล์ setup โดยจะไม่ซ้ำเมื่อรัน SQL อีกครั้ง

หน้าการศึกษากดเลือกระดับหรือปุ่มลูกศรเพื่อดูรายละเอียด หน้าประวัติมีรูปที่พลิกได้และแท็บข้อมูลส่วนตัว/ติดต่อ/ความสามารถ หน้าการแข่งขันและกิจกรรมค้นหา กรองประเภท และเปิดรายละเอียดได้ แอนิเมชันลดลงเมื่อเปิด reduced motion ในอุปกรณ์

Welcome มีเอฟเฟกต์พิมพ์ทีละตัวที่เผื่อพื้นที่ข้อความไว้ และป้ายยืดเมื่อชี้/กดค้างลากลงด้วยเมาส์หรือนิ้ว ปล่อยแล้วป้ายเด้งกลับ หน้าด้านในตรึงเมนูและส่วนท้ายให้ขนาดเท่ากัน โดยเลื่อนอ่านข้อมูลในพื้นที่ตรงกลาง ส่วนแท็บประวัติและรายละเอียดการศึกษาเผื่อความสูงให้สลับข้อมูลแล้วไม่ดันเลย์เอาต์

motion.js และ stability.css ดูแลเอฟเฟกต์พิมพ์ ป้ายยืด และขนาดหน้า
# Project Showcase

The Profile page reads Projects from `pastel_portfolio_entries` (kind `project`). Admins can add, edit, delete and upload preview images through Supabase Storage. Only HTTP/HTTPS website links are accepted. Visitors cannot modify projects.

Run `supabase-setup.sql` in Supabase SQL Editor first, then `supabase-projects.sql` to enable project links and seed Willow. Existing installations only need the second file. Create an Auth user and add its UUID to `pastel_portfolio_admins` as described in the setup file. No service-role key belongs in this website.

The Willow screenshot is a saved preview, not a live embedded page. It remains visible while database setup is incomplete; after a successful database load, only stored projects are shown, including an empty list after deleting all projects.

# Video Links

Run `supabase-video-links.sql` in SQL Editor to enable the optional `video_url` field. Admins can paste or clear a video link for projects, competitions, activities and certificates. YouTube (watch, Shorts, live, share links), Vimeo and direct MP4/WebM/OGV links have players in the detail dialog. Other HTTP/HTTPS links open the original video externally. No arbitrary iframe HTML is accepted. Providers can restrict embedding; the original-source button remains available. Closing the dialog stops playback.
# School Logos

The education editor accepts a JPG, PNG or WebP school logo (up to 10 MB), with a local preview. Logos use the existing `media_path`/`media_type` fields and Supabase Storage policies; no additional SQL migration is needed. Replacing or removing an uploaded logo cleans up its old storage file after saving. Removing a custom logo restores the built-in logo when available. If only the built-in education records are visible, an admin should use the save-education button first to store those records, then edit the desired school.
# Competition Levels

Run `supabase-competition-levels.sql` in SQL Editor to enable the `competition_level` field. Competition editors offer school, province, region and national levels. The summary counts all stored competitions, and each level can be combined with category and text filters. Older unclassified records are counted in the total and can be filtered separately; no level is inferred from their titles or descriptions.
# Competition Awards

Competition editors use a separate award dropdown: winner, runners-up 1 through 4, honorable mention and participation. Awards use the existing `subtitle` column and work with the existing award filters; no SQL migration is required. Existing custom award text is preserved as an option when editing its original record.
# Motion And Layout

The portfolio uses the original light pastel theme only. Profile measurements are batched per animation frame; dragging the badge caches layout measurements instead of reading layout on every pointer move. Repeated content-fade animations are disabled, and reduced-motion preferences disable transitions. Saving edits preserves the main scroll position.

Verified at desktop/tablet/mobile widths (1440, 768, 390, 320): navigation, dropdown bounds, stable page frames, profile tabs, education switching, pointer/touch badge dragging and reduced motion. CRUD, awards, competition summaries, video links and school logos were regression-tested with mocked services. Real Supabase read-only checks returned HTTP 200 for the profile/entries tables and website/video/competition fields; no real administrative writes were made during QA.
