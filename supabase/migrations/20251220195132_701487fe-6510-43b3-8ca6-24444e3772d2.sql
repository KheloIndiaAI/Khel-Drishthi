-- Enable RLS on all reference data tables with public read access
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE centre_sport_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympic_medals ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympic_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympic_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncoe_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE stc_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_overlap ENABLE ROW LEVEL SECURITY;

-- Public read policies for reference data
CREATE POLICY "Sports publicly readable" ON sports FOR SELECT USING (true);
CREATE POLICY "Centres publicly readable" ON centres FOR SELECT USING (true);
CREATE POLICY "Disciplines publicly readable" ON disciplines FOR SELECT USING (true);
CREATE POLICY "Centre sport links publicly readable" ON centre_sport_links FOR SELECT USING (true);
CREATE POLICY "Olympic medals publicly readable" ON olympic_medals FOR SELECT USING (true);
CREATE POLICY "Olympic participation publicly readable" ON olympic_participation FOR SELECT USING (true);
CREATE POLICY "Olympic timeline publicly readable" ON olympic_timeline FOR SELECT USING (true);
CREATE POLICY "Events publicly readable" ON events FOR SELECT USING (true);
CREATE POLICY "NCOE capacity publicly readable" ON ncoe_capacity FOR SELECT USING (true);
CREATE POLICY "STC capacity publicly readable" ON stc_capacity FOR SELECT USING (true);
CREATE POLICY "Event overlap publicly readable" ON event_overlap FOR SELECT USING (true);

-- Admin write policies for reference data
CREATE POLICY "Admins manage sports" ON sports FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage centres" ON centres FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage disciplines" ON disciplines FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage links" ON centre_sport_links FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage medals" ON olympic_medals FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage participation" ON olympic_participation FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage timeline" ON olympic_timeline FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage events" ON events FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage ncoe" ON ncoe_capacity FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage stc" ON stc_capacity FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage overlap" ON event_overlap FOR ALL USING (public.has_role(auth.uid(), 'admin'));