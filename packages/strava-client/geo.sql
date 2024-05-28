ALTER TABLE activities MODIFY start_latlng POINT NOT NULL;
ALTER TABLE activities ADD SPATIAL INDEX (start_latlng);

select * from activities where ST_Distance(start_latlng, POINT(40.766890458762646,-73.98450130596757)) < 0.0005;