-- Reset only the isolated Revelry testing workspace.
-- Safe target: revelry-labs-testing

UPDATE accounts
SET
  state_blob = '{"companyName":"Revelry Labs (Testing)","adminName":""}',
  state_version = COALESCE(state_version, 0) + 1,
  updated_at = CURRENT_TIMESTAMP
WHERE company_id = 'revelry-labs-testing';

DELETE FROM sessions
WHERE company_id = 'revelry-labs-testing';

DELETE FROM events_recommended
WHERE company_id = 'revelry-labs-testing';
