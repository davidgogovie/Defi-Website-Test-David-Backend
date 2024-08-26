--
-- ADD COLUMN to table `user`
--
ALTER TABLE `user`
  ADD `get_bnb` TINYINT NOT NULL AFTER `role`;