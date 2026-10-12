-- Run after supabase-setup.sql. Adds the education supplied in your image.
-- Re-running this file will not duplicate these four records.
insert into public.pastel_portfolio_entries (id,kind,title,subtitle,period,description) values
('5136d8c0-0001-4000-8000-000000000001','education','โรงเรียนอนุบาลวัดเกาะใหญ่ (เลี้ยงล้อมอนุกูล)','ระดับประถมศึกษา','2561','สำเร็จการศึกษา ปี 2561'),
('5136d8c0-0002-4000-8000-000000000002','education','โรงเรียนถาวรานุกูล','ระดับมัธยมศึกษาตอนต้น','2564',E'สำเร็จการศึกษา ปี 2564\nGPAX : 3.12'),
('5136d8c0-0003-4000-8000-000000000003','education','วิทยาลัยเทคนิคสมุทรสงคราม','ระดับประกาศนียบัตรวิชาชีพ','2567',E'สาขาวิชาคอมพิวเตอร์ธุรกิจ\nสำเร็จการศึกษา ปี 2567\nGPAX : 3.86'),
('5136d8c0-0004-4000-8000-000000000004','education','วิทยาลัยเทคนิคสมุทรสงคราม','ระดับประกาศนียบัตรวิชาชีพชั้นสูง','กำลังศึกษา',E'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล\nGPAX : 3.88 (3 เทอม)')
on conflict (id) do nothing;
