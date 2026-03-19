insert into events_master (id, event_name, short_description, vendor_url, cost_per_person, goals, schedules, event_type, facilitation_kit, is_global)
values
('evt-1','Virtual Trivia League','Live-hosted team trivia with custom company rounds.','https://teambuilding.com/team-building/virtual',35,array['Boost morale','Strengthen team connection'],array['Lunch','After 5p'],'paid',null,true),
('evt-2','Mindful Monday Workshop','Guided wellbeing and stress reset for teams.','https://www.withconfetti.com/',20,array['Support employee wellbeing','Boost morale'],array['Before 9a','Lunch'],'paid',null,true),
('evt-3','Creative Build Challenge','Hands-on problem-solving challenge in small groups.','https://www.kraftylab.com/',42,array['Improve employee performance','Strengthen team connection'],array['After 5p','Weekends'],'paid',null,true),
('evt-4','Employer Brand Story Jam','Employee storytelling sprint for recruiting brand content.','https://www.teamraderie.com/experience-finder/',28,array['Boost morale'],array['Lunch','After 5p'],'paid',null,true),
('evt-5','Peer Coaching Pods','Structured peer coaching circles with prompts.','https://www.withconfetti.com/',18,array['Boost morale','Improve employee performance'],array['Before 9a','Lunch'],'paid',null,true),
('evt-6','Zero-Cost Team Reflection Sprint','Facilitated retrospective format to improve team alignment.','https://www.notion.so/',0,array['Strengthen team connection','Improve employee performance'],array['Lunch','After 5p'],'free','{"host_script":"Kickoff, framing, and closing script.","agenda":"45-minute agenda with checkpoints.","timeline":"Minute-by-minute facilitation timeline.","discussion_prompts":"Guided prompts for team reflection.","follow_up_template":"Post-session action follow-up template."}'::jsonb,true),
('evt-7','Lunch-and-Learn Lightning Talks','Employee-led quick talks for knowledge sharing.','https://calendar.google.com/',12,array['Improve employee performance'],array['Lunch'],'paid',null,true),
('evt-8','Recognition Roundtable','Peer appreciation format to boost morale.','https://www.withconfetti.com/',0,array['Boost morale'],array['After 5p','Lunch'],'free','{"host_script":"Recognition-focused facilitation script.","agenda":"30-minute recognition agenda.","timeline":"Structured round-robin timing guide.","discussion_prompts":"Prompt list for appreciation and wins.","follow_up_template":"Template for monthly recognition follow-up."}'::jsonb,true)
on conflict (id) do update set
event_name = excluded.event_name,
short_description = excluded.short_description,
vendor_url = excluded.vendor_url,
cost_per_person = excluded.cost_per_person,
goals = excluded.goals,
schedules = excluded.schedules,
event_type = excluded.event_type,
facilitation_kit = excluded.facilitation_kit,
is_global = excluded.is_global;
