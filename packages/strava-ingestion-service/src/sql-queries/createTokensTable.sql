CREATE TABLE
  IF NOT EXISTS `tokens` (
    `id` MEDIUMINT NOT NULL AUTO_INCREMENT,
    `access_token` varchar(255),
    `refresh_token` varchar(255),
    `expires` int,
    PRIMARY KEY (id)
  ) DEFAULT CHARSET utf8mb4;