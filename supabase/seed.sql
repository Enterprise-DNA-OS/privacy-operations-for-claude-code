begin;
select set_config('app.actor','Demo seed',true);
insert into systems(id,name,owner,purpose,categories,location,retention_rule,retention_review,security_evidence) values
('10000000-0000-0000-0000-000000000001','Harbour Client Records','Mere','Client service','Contact details','NZ','Review at end of client engagement',current_date-10,'Access review DEMO-001'),
('10000000-0000-0000-0000-000000000002','Harbour Marketing','Hana','Newsletter subscriptions','Email preferences','AU',null,null,null),
('10000000-0000-0000-0000-000000000003','Kowhai Support','Tane','Support requests','Ticket summaries','NZ','Review annually',current_date+90,'Access review DEMO-002') on conflict(id) do nothing;
insert into activities(id,name,owner,system_id,purpose,subjects,recipients,jurisdiction,review_due) values
('20000000-0000-0000-0000-000000000001','Client onboarding','Mere','10000000-0000-0000-0000-000000000001','Deliver requested service','Clients','Service team','NZ',current_date+14),
('20000000-0000-0000-0000-000000000002','Newsletter signup',null,'10000000-0000-0000-0000-000000000002','Send requested newsletters','Subscribers','Marketing provider','AU',current_date-7) on conflict(id) do nothing;
insert into assessments(id,name,owner,system_id,status,likelihood,impact,due_date,renewal_date,evidence) values
('30000000-0000-0000-0000-000000000001','Marketing retention review','Hana','10000000-0000-0000-0000-000000000002','in-review',4,4,current_date-3,current_date+60,'Demo workshop notes'),
('30000000-0000-0000-0000-000000000002','Client access assessment','Mere','10000000-0000-0000-0000-000000000001','draft',2,4,current_date+7,current_date+180,null),
('30000000-0000-0000-0000-000000000003','Support process assessment','Tane','10000000-0000-0000-0000-000000000003','draft',2,2,current_date+21,current_date+365,'Demo support review') on conflict(id) do nothing;
insert into actions(id,name,owner,assessment_id,due_date) values
('40000000-0000-0000-0000-000000000001','Confirm newsletter retention purpose','Hana','30000000-0000-0000-0000-000000000001',current_date-2),
('40000000-0000-0000-0000-000000000002','Check client access list','Mere','30000000-0000-0000-0000-000000000002',current_date+5) on conflict(id) do nothing;
insert into requests(id,name,owner,kind,received_on,due_date,deadline_basis) values
('50000000-0000-0000-0000-000000000001','DEMO-ACCESS-001','Mere','access',current_date-35,current_date-5,'Demonstration deadline only; privacy officer must confirm'),
('50000000-0000-0000-0000-000000000002','DEMO-CORRECTION-002','Hana','correction',current_date-2,null,null) on conflict(id) do nothing;
commit;
