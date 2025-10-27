-- Force type regeneration by adding comments to tables
COMMENT ON TABLE public.leads IS 'Lead capture data from IQ test';
COMMENT ON TABLE public.iq_test_results IS 'IQ test results for each lead';
COMMENT ON TABLE public.user_roles IS 'User role assignments';