-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 18, 2026 at 09:36 PM
-- Server version: 10.6.22-MariaDB-0ubuntu0.22.04.1
-- PHP Version: 8.1.2-1ubuntu2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hgr9ba_b`
--

-- CREATE DATABASE hgr9ba_b
--   CHARACTER SET utf8mb4
--   COLLATE utf8mb4_general_ci;
-- --------------------------------------------------------


--
-- Table structure for table `CustomerOrder`
--


CREATE TABLE `CustomerOrder` (
  `OrderID` int(11) NOT NULL AUTO_INCREMENT,
  `CustomerEmail` varchar(255) NOT NULL,
  `Timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`OrderID`,`CustomerEmail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; -- should be same collation for ALL tables in the db, otherwise issues with keys.

--
-- Dumping data for table `CustomerOrder`
--

INSERT INTO `CustomerOrder` (`OrderID`, `CustomerEmail`, `Timestamp`) VALUES
(1, 'qtreffreyn@nasa.gov', '2026-03-10 15:58:00'),
(2, 'gbatalleo@moonfruit.com', '2026-03-11 14:58:00'),
(3, 'hortzenp@cbsnews.com', '2026-03-12 18:58:00'),
(4, 'afreanq@de.vu', '2026-03-13 20:58:00'),
(5, 'ccaudwellr@ebay.co.uk', '2026-03-14 15:58:00'),
(6, 'pchilderss@mashable.com', '2026-03-15 15:59:00'),
(7, 'edeclerkt@foxnews.com', '2026-03-16 15:28:00'),
(8, 'tapfelu@va.gov', '2026-03-17 15:38:00'),
(9, 'tsouthallv@shop-pro.jp', '2026-03-18 15:48:00'),
(10, 'pmaccaffreyw@ted.com', '2026-03-19 15:51:00'),
(11, 'bmcgeneayx@tiny.cc', '2026-03-20 15:52:00'),
(12, 'mmcgoldricky@chicagotribune.com', '2026-03-21 15:53:00'),
(13, 'gduprez@hibu.com', '2026-03-22 15:54:00');

-- --------------------------------------------------------

--
-- Table structure for table `Customer_R1`
--

CREATE TABLE `Customer_R1` (
  `Email` varchar(255) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Customer_R1`
--

INSERT INTO `Customer_R1` (`Email`, `PhoneNumber`) VALUES
('msivess18@dagondesign.com', '118-831-3958'),
('msyce2r@imgur.com', '143-314-8706'),
('jjimson21@php.net', '145-483-6000'),
('acaesar1j@wix.com', '165-438-6149'),
('aranklin2o@mashable.com', '175-698-4184'),
('lbonass1r@hubpages.com', '198-454-9177'),
('kgribbell10@usa.gov', '206-246-5057'),
('mhurcombe1@freewebs.com', '215-747-7587'),
('llemm13@techcrunch.com', '222-970-6984'),
('plyptradeb@wikia.com', '267-369-2408'),
('hjodlowskim@businessinsider.com', '274-341-0541'),
('vcarriagel@usgs.gov', '284-415-1320'),
('jrodway1k@godaddy.com', '293-258-5985'),
('theed1u@purevolume.com', '296-984-4452'),
('fbatchley1s@washington.edu', '317-478-1787'),
('wslimmon2h@rediff.com', '322-175-0452'),
('rdurbin16@163.com', '323-496-7657'),
('rpaleyh@dagondesign.com', '324-727-0079'),
('ktettley5@myspace.com', '331-846-9075'),
('fvasyutin14@noaa.gov', '368-707-8108'),
('amawdsley23@gravatar.com', '384-474-0357'),
('rmacgown1c@sitemeter.com', '386-156-3187'),
('edeclerkt@foxnews.com', '396-525-1826'),
('blambrook27@blogspot.com', '400-698-9315'),
('rhaisell2j@istockphoto.com', '403-618-1629'),
('bhartly1y@drupal.org', '410-279-8624'),
('wbedow1w@ow.ly', '411-908-3682'),
('acinavas9@discuz.net', '416-453-2852'),
('jbowstead2a@weebly.com', '417-687-2829'),
('icawsby2m@issuu.com', '417-930-3136'),
('pkunzel19@prlog.org', '421-384-9201'),
('seagling0@hexun.com', '423-212-8991'),
('rriccard1d@storify.com', '423-773-7860'),
('bsoldi17@java.com', '424-276-5632'),
('ptregidgad@theglobeandmail.com', '440-156-2776'),
('nmarklin2d@amazon.co.jp', '447-883-6003'),
('euff2q@slate.com', '456-992-8317'),
('bmcgeneayx@tiny.cc', '467-744-2264'),
('zzohrer1n@ihg.com', '470-416-7708'),
('mduquesnay1h@time.com', '476-182-5832'),
('ldecarteret1m@europa.eu', '479-189-9650'),
('oringer1e@bandcamp.com', '481-545-0967'),
('iwonter7@jimdo.com', '487-299-3563'),
('hdurnell1x@thetimes.co.uk', '494-176-6554'),
('ahastone@hud.gov', '497-157-5190'),
('gbatalleo@moonfruit.com', '534-480-7695'),
('tapfelu@va.gov', '542-165-9449'),
('bdacosta8@wisc.edu', '559-612-9136'),
('sderill1g@vistaprint.com', '560-906-5554'),
('cbaxter24@gov.uk', '568-501-8264'),
('ccaudwellr@ebay.co.uk', '569-993-8248'),
('mkindall2i@un.org', '572-687-1086'),
('dgarrowj@chron.com', '585-396-3318'),
('flear1q@wordpress.com', '587-621-2164'),
('rballston2p@umn.edu', '591-971-6380'),
('nlacea@weebly.com', '629-288-5459'),
('spetrowsky2g@simplemachines.org', '631-770-0486'),
('glenahan2k@weibo.com', '634-899-1002'),
('bfullbrook2s@etsy.com', '644-156-0646'),
('pchilderss@mashable.com', '661-551-9708'),
('soury1o@desdev.cn', '663-412-4520'),
('cbiggadike26@cargocollective.com', '673-972-1398'),
('cmountcastle28@shinystat.com', '688-599-4947'),
('gduprez@hibu.com', '691-819-7297'),
('afryman2l@freewebs.com', '702-329-7474'),
('abrave2b@sciencedaily.com', '709-725-7877'),
('vgeldeard25@springer.com', '713-749-7145'),
('gfairfull11@independent.co.uk', '716-443-8949'),
('kandretti2@ted.com', '718-984-2714'),
('pmaccrackan4@slideshare.net', '722-214-6693'),
('scadman20@canalblog.com', '723-107-8110'),
('afryetti@statcounter.com', '738-616-7037'),
('fscupham22@tinypic.com', '749-938-3224'),
('ihendrix1l@blogspot.com', '766-633-3975'),
('mlongmire12@github.com', '767-598-3113'),
('jkingescot2e@yolasite.com', '780-486-4009'),
('pmaccaffreyw@ted.com', '785-283-2995'),
('dvedenisov6@acquirethisname.com', '789-478-3427'),
('dfihelly1p@usnews.com', '796-166-7924'),
('mmcgoldricky@chicagotribune.com', '798-348-2869'),
('tsouthallv@shop-pro.jp', '799-106-8487'),
('jstirlingk@live.com', '807-474-9810'),
('igimblett2f@boston.com', '812-318-0182'),
('tmelato2c@gnu.org', '820-400-2246'),
('npobjoy15@columbia.edu', '824-111-5219'),
('lhitzmanng@github.io', '828-978-6509'),
('qtreffreyn@nasa.gov', '842-460-8122'),
('eritchingsf@paypal.com', '842-953-4300'),
('hdonan29@yellowbook.com', '844-131-5552'),
('lkrimmer1i@home.pl', '865-865-3976'),
('hortzenp@cbsnews.com', '874-826-7730'),
('afreanq@de.vu', '880-194-8656'),
('beakin1v@indiegogo.com', '892-495-8840'),
('ctillerton2n@theglobeandmail.com', '903-417-5384'),
('cwoodeson1z@vinaora.com', '903-556-5655'),
('aholmec@istockphoto.com', '928-191-8513'),
('bstonuary1b@domainmarket.com', '928-465-7956'),
('smarzele1a@sciencedaily.com', '935-764-6644'),
('drugiero1f@amazon.co.jp', '948-458-1249'),
('bbuckenham2t@merriam-webster.com', '953-811-1974'),
('efinicj3@imgur.com', '970-932-8701'),
('dkenford1t@soundcloud.com', '974-670-3069');

-- --------------------------------------------------------

--
-- Table structure for table `Customer_R2`
--

CREATE TABLE `Customer_R2` (
  `PhoneNumber` varchar(20) NOT NULL,
  `Username` varchar(100) NOT NULL,
  `Email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Customer_R2`
--

INSERT INTO `Customer_R2` (`PhoneNumber`, `Username`, `Email`) VALUES
('118-831-3958', 'msivess18', 'msivess18@dagondesign.com'),
('143-314-8706', 'msyce2r', 'msyce2r@imgur.com'),
('145-483-6000', 'jjimson21', 'jjimson21@php.net'),
('165-438-6149', 'acaesar1j', 'acaesar1j@wix.com'),
('175-698-4184', 'aranklin2o', 'aranklin2o@mashable.com'),
('198-454-9177', 'lbonass1r', 'lbonass1r@hubpages.com'),
('206-246-5057', 'kgribbell10', 'kgribbell10@usa.gov'),
('215-747-7587', 'mhurcombe1', 'mhurcombe1@freewebs.com'),
('222-970-6984', 'llemm13', 'llemm13@techcrunch.com'),
('267-369-2408', 'plyptradeb', 'plyptradeb@wikia.com'),
('274-341-0541', 'hjodlowskim', 'hjodlowskim@businessinsider.com'),
('284-415-1320', 'vcarriagel', 'vcarriagel@usgs.gov'),
('293-258-5985', 'jrodway1k', 'jrodway1k@godaddy.com'),
('296-984-4452', 'theed1u', 'theed1u@purevolume.com'),
('317-478-1787', 'fbatchley1s', 'fbatchley1s@washington.edu'),
('322-175-0452', 'wslimmon2h', 'wslimmon2h@rediff.com'),
('323-496-7657', 'rdurbin16', 'rdurbin16@163.com'),
('324-727-0079', 'rpaleyh', 'rpaleyh@dagondesign.com'),
('331-846-9075', 'ktettley5', 'ktettley5@myspace.com'),
('368-707-8108', 'fvasyutin14', 'fvasyutin14@noaa.gov'),
('384-474-0357', 'amawdsley23', 'amawdsley23@gravatar.com'),
('386-156-3187', 'rmacgown1c', 'rmacgown1c@sitemeter.com'),
('396-525-1826', 'edeclerkt', 'edeclerkt@foxnews.com'),
('400-698-9315', 'blambrook27', 'blambrook27@blogspot.com'),
('403-618-1629', 'rhaisell2j', 'rhaisell2j@istockphoto.com'),
('410-279-8624', 'bhartly1y', 'bhartly1y@drupal.org'),
('411-908-3682', 'wbedow1w', 'wbedow1w@ow.ly'),
('416-453-2852', 'acinavas9', 'acinavas9@discuz.net'),
('417-687-2829', 'jbowstead2a', 'jbowstead2a@weebly.com'),
('417-930-3136', 'icawsby2m', 'icawsby2m@issuu.com'),
('421-384-9201', 'pkunzel19', 'pkunzel19@prlog.org'),
('423-212-8991', 'seagling0', 'seagling0@hexun.com'),
('423-773-7860', 'rriccard1d', 'rriccard1d@storify.com'),
('424-276-5632', 'bsoldi17', 'bsoldi17@java.com'),
('440-156-2776', 'ptregidgad', 'ptregidgad@theglobeandmail.com'),
('447-883-6003', 'nmarklin2d', 'nmarklin2d@amazon.co.jp'),
('456-992-8317', 'euff2q', 'euff2q@slate.com'),
('467-744-2264', 'bmcgeneayx', 'bmcgeneayx@tiny.cc'),
('470-416-7708', 'zzohrer1n', 'zzohrer1n@ihg.com'),
('476-182-5832', 'mduquesnay1h', 'mduquesnay1h@time.com'),
('479-189-9650', 'ldecarteret1m', 'ldecarteret1m@europa.eu'),
('481-545-0967', 'oringer1e', 'oringer1e@bandcamp.com'),
('487-299-3563', 'iwonter7', 'iwonter7@jimdo.com'),
('494-176-6554', 'hdurnell1x', 'hdurnell1x@thetimes.co.uk'),
('497-157-5190', 'ahastone', 'ahastone@hud.gov'),
('534-480-7695', 'gbatalleo', 'gbatalleo@moonfruit.com'),
('542-165-9449', 'tapfelu', 'tapfelu@va.gov'),
('559-612-9136', 'bdacosta8', 'bdacosta8@wisc.edu'),
('560-906-5554', 'sderill1g', 'sderill1g@vistaprint.com'),
('568-501-8264', 'cbaxter24', 'cbaxter24@gov.uk'),
('569-993-8248', 'ccaudwellr', 'ccaudwellr@ebay.co.uk'),
('572-687-1086', 'mkindall2i', 'mkindall2i@un.org'),
('585-396-3318', 'dgarrowj', 'dgarrowj@chron.com'),
('587-621-2164', 'flear1q', 'flear1q@wordpress.com'),
('591-971-6380', 'rballston2p', 'rballston2p@umn.edu'),
('629-288-5459', 'nlacea', 'nlacea@weebly.com'),
('631-770-0486', 'spetrowsky2g', 'spetrowsky2g@simplemachines.org'),
('634-899-1002', 'glenahan2k', 'glenahan2k@weibo.com'),
('644-156-0646', 'bfullbrook2s', 'bfullbrook2s@etsy.com'),
('661-551-9708', 'pchilderss', 'pchilderss@mashable.com'),
('663-412-4520', 'soury1o', 'soury1o@desdev.cn'),
('673-972-1398', 'cbiggadike26', 'cbiggadike26@cargocollective.com'),
('688-599-4947', 'cmountcastle28', 'cmountcastle28@shinystat.com'),
('691-819-7297', 'gduprez', 'gduprez@hibu.com'),
('702-329-7474', 'afryman2l', 'afryman2l@freewebs.com'),
('709-725-7877', 'abrave2b', 'abrave2b@sciencedaily.com'),
('713-749-7145', 'vgeldeard25', 'vgeldeard25@springer.com'),
('716-443-8949', 'gfairfull11', 'gfairfull11@independent.co.uk'),
('718-984-2714', 'kandretti2', 'kandretti2@ted.com'),
('722-214-6693', 'pmaccrackan4', 'pmaccrackan4@slideshare.net'),
('723-107-8110', 'scadman20', 'scadman20@canalblog.com'),
('738-616-7037', 'afryetti', 'afryetti@statcounter.com'),
('749-938-3224', 'fscupham22', 'fscupham22@tinypic.com'),
('766-633-3975', 'ihendrix1l', 'ihendrix1l@blogspot.com'),
('767-598-3113', 'mlongmire12', 'mlongmire12@github.com'),
('780-486-4009', 'jkingescot2e', 'jkingescot2e@yolasite.com'),
('785-283-2995', 'pmaccaffreyw', 'pmaccaffreyw@ted.com'),
('789-478-3427', 'dvedenisov6', 'dvedenisov6@acquirethisname.com'),
('796-166-7924', 'dfihelly1p', 'dfihelly1p@usnews.com'),
('798-348-2869', 'mmcgoldricky', 'mmcgoldricky@chicagotribune.com'),
('799-106-8487', 'tsouthallv', 'tsouthallv@shop-pro.jp'),
('807-474-9810', 'jstirlingk', 'jstirlingk@live.com'),
('812-318-0182', 'igimblett2f', 'igimblett2f@boston.com'),
('820-400-2246', 'tmelato2c', 'tmelato2c@gnu.org'),
('824-111-5219', 'npobjoy15', 'npobjoy15@columbia.edu'),
('828-978-6509', 'lhitzmanng', 'lhitzmanng@github.io'),
('842-460-8122', 'qtreffreyn', 'qtreffreyn@nasa.gov'),
('842-953-4300', 'eritchingsf', 'eritchingsf@paypal.com'),
('844-131-5552', 'hdonan29', 'hdonan29@yellowbook.com'),
('865-865-3976', 'lkrimmer1i', 'lkrimmer1i@home.pl'),
('874-826-7730', 'hortzenp', 'hortzenp@cbsnews.com'),
('880-194-8656', 'afreanq', 'afreanq@de.vu'),
('892-495-8840', 'beakin1v', 'beakin1v@indiegogo.com'),
('903-417-5384', 'ctillerton2n', 'ctillerton2n@theglobeandmail.com'),
('903-556-5655', 'cwoodeson1z', 'cwoodeson1z@vinaora.com'),
('928-191-8513', 'aholmec', 'aholmec@istockphoto.com'),
('928-465-7956', 'bstonuary1b', 'bstonuary1b@domainmarket.com'),
('935-764-6644', 'smarzele1a', 'smarzele1a@sciencedaily.com'),
('948-458-1249', 'drugiero1f', 'drugiero1f@amazon.co.jp'),
('953-811-1974', 'bbuckenham2t', 'bbuckenham2t@merriam-webster.com'),
('970-932-8701', 'efinicj3', 'efinicj3@imgur.com'),
('974-670-3069', 'dkenford1t', 'dkenford1t@soundcloud.com');

-- --------------------------------------------------------

--
-- Table structure for table `ItemRequest`
--

CREATE TABLE `ItemRequest` (
  `ID` int(11) NOT NULL,
  `CustomerEmail` varchar(255) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ItemRequest`
--

INSERT INTO `ItemRequest` (`ID`, `CustomerEmail`, `Name`, `Description`) VALUES
(1, 'seagling0@hexun.com', 'Cheddar Cheese', 'I want this item'),
(2, 'mhurcombe1@freewebs.com', 'Halibut', 'I want this item'),
(3, 'kandretti2@ted.com', 'White Sugar', 'I want this item'),
(4, 'efinicj3@imgur.com', 'Eggplant', 'I want this item'),
(5, 'pmaccrackan4@slideshare.net', 'Green Tea', 'I want this item'),
(6, 'ktettley5@myspace.com', 'Lime', 'I want this item'),
(7, 'dvedenisov6@acquirethisname.com', 'Avocado Oil', 'I want this item'),
(8, 'iwonter7@jimdo.com', 'Tilapia', 'I want this item'),
(9, 'bdacosta8@wisc.edu', 'Jasmine Rice', 'I want this item'),
(10, 'acinavas9@discuz.net', 'Basmati Rice', 'I want this item'),
(11, 'nlacea@weebly.com', 'Parmesan Cheese', 'I want this item'),
(12, 'plyptradeb@wikia.com', 'Powdered Sugar', 'I want this item'),
(13, 'aholmec@istockphoto.com', 'Sourdough Bread', 'I want this item'),
(14, 'ptregidgad@theglobeandmail.com', 'Spinach', 'I want this item');

-- --------------------------------------------------------

--
-- Table structure for table `Item_R1`
--

CREATE TABLE `Item_R1` (
  `ItemID` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  `IsSelling` tinyint(1) NOT NULL DEFAULT 1
) ;

--
-- Dumping data for table `Item_R1`
--

INSERT INTO `Item_R1` (`ItemID`, `Name`, `Quantity`, `Price`, `IsSelling`) VALUES
(1, 'Sushi Rice', 22, '4.50', 1),
(2, 'Arabica Coffee', 45, '20.00', 1),
(3, 'Black Rice', 30, '6.00', 1),
(4, 'Long Grain Rice', 12, '1.50', 1),
(5, 'Plum', 37, '4.00', 1),
(6, 'All-Purpose Flour', 55, '1.75', 1),
(7, 'Corn Oil', 96, '2.50', 1),
(8, 'Egg (Goose)', 44, '2.50', 1),
(9, 'Greek Yogurt', 91, '3.00', 1),
(10, 'Egg (Duck)', 43, '1.00', 1),
(11, 'Long Grain Rice', 62, '1.60', 1),
(12, 'White Sugar', 91, '2.00', 1),
(13, 'Rye Bread', 26, '3.00', 1),
(14, 'Plum', 95, '4.00', 1),
(15, 'Strawberries', 54, '6.00', 1),
(16, 'Feta Cheese', 94, '7.00', 1),
(17, 'Bread Flour', 27, '1.50', 1),
(18, 'Swiss Cheese', 49, '8.00', 1),
(19, 'Arabica Coffee', 55, '20.00', 1),
(20, 'White Sugar', 65, '2.00', 1),
(21, 'Spinach', 72, '2.50', 1),
(22, 'Trout', 49, '12.00', 1),
(23, 'Green Beans', 81, '2.00', 1),
(24, 'Cabbage', 88, '1.00', 1),
(25, 'Parmesan Cheese', 63, '12.00', 1),
(26, 'Raw Sugar', 31, '1.50', 1),
(27, 'Egg (Quail)', 97, '0.80', 1),
(28, 'Mushrooms', 72, '6.00', 1),
(29, 'Oatmeal Biscuit', 16, '5.00', 1),
(30, 'Pear', 77, '4.50', 1),
(31, 'Cucumber', 19, '1.75', 1),
(32, 'Pineapple', 18, '3.50', 1),
(33, 'Olive Oil', 47, '6.00', 1),
(34, 'Herbal Tea', 77, '30.00', 1),
(35, 'Haddock', 46, '9.00', 1),
(36, 'Onion', 39, '2.00', 1),
(37, 'Sushi Rice', 75, '4.50', 1),
(38, 'Pineapple', 48, '3.45', 1),
(39, 'Zucchini', 61, '2.50', 1),
(40, 'Short Grain Rice', 60, '3.00', 1),
(41, 'Mango', 24, '5.00', 1),
(42, 'Lemon', 12, '2.30', 1),
(43, 'Black Coffee', 84, '15.00', 1),
(44, 'Butter', 51, '3.00', 1),
(45, 'Multigrain Bread', 65, '3.50', 1),
(46, 'Long Grain Rice', 67, '1.50', 1),
(47, 'Bread Flour', 14, '1.50', 1),
(48, 'Kiwi', 45, '6.00', 1),
(49, 'Mango', 92, '5.00', 1),
(50, 'Sourdough Bread', 41, '4.00', 1),
(51, 'Short Grain Rice', 41, '4.50', 1),
(52, 'Orange', 85, '3.00', 1),
(53, 'Pineapple', 44, '3.40', 1),
(54, 'White Bread', 92, '2.50', 1),
(55, 'Green Coffee', 62, '12.00', 1),
(56, 'Zucchini', 26, '2.50', 1),
(57, 'Sourdough Bread', 59, '4.50', 1),
(58, 'Orange', 88, '2.90', 1),
(59, 'Sardines', 91, '6.00', 1),
(60, 'Olive Oil', 28, '6.00', 1),
(61, 'Carrot', 51, '1.50', 1),
(62, 'Black Tea', 46, '5.00', 1),
(63, 'Pear', 82, '4.45', 1),
(64, 'Olive Oil', 100, '6.00', 1),
(65, 'Ricotta Cheese', 51, '6.00', 1),
(66, 'Black Coffee', 61, '15.00', 1),
(67, 'White Tea', 99, '25.00', 1),
(68, 'Cucumber', 13, '1.80', 1),
(69, 'Mozzarella Cheese', 45, '7.00', 1),
(70, 'Broccoli', 73, '4.00', 1),
(71, 'Eggplant', 39, '3.00', 1),
(72, 'Trout', 29, '12.00', 1),
(73, 'Heavy Cream', 12, '4.00', 1),
(74, 'Bell Pepper', 96, '4.45', 1),
(75, 'Onion', 35, '2.00', 1),
(76, 'Sardines', 89, '6.00', 1),
(77, 'Mango', 60, '4.50', 1),
(78, 'Arborio Rice', 20, '4.50', 1),
(79, 'Potato', 28, '1.20', 1),
(80, 'Corn Oil', 20, '2.50', 1),
(81, 'Butter Biscuit', 38, '6.00', 1),
(82, 'Peas', 99, '3.00', 1),
(83, 'Cream', 92, '2.50', 1),
(84, 'Spinach', 41, '2.40', 1),
(85, 'Sardines', 44, '6.00', 1),
(86, 'White Sugar', 47, '2.00', 1),
(87, 'Bread Flour', 21, '1.50', 1),
(88, 'Cucumber', 85, '1.80', 1),
(89, 'Swiss Cheese', 29, '8.00', 1),
(90, 'Peanut Oil', 64, '4.00', 1),
(91, 'Blueberries', 66, '10.00', 1),
(92, 'Chocolate Biscuit', 75, '5.00', 1),
(93, 'Cheese', 53, '9.00', 1),
(94, 'Palm Oil', 43, '1.80', 1),
(95, 'Eggplant', 74, '3.00', 1),
(96, 'Garlic', 27, '7.00', 1),
(97, 'Jasmine Rice', 91, '4.75', 1),
(98, 'Rice Flour', 52, '2.00', 1),
(99, 'Zucchini', 43, '2.50', 1),
(100, 'Multigrain Bread', 56, '3.20', 1),
(101, 'Ricotta Cheese', 66, '6.00', 1),
(102, 'Bread Flour', 84, '1.50', 1),
(103, 'Cottage Cheese', 37, '5.00', 1),
(104, 'Whipped Cream', 29, '4.00', 1),
(105, 'Almond Flour', 13, '9.50', 1),
(106, 'Lemon', 63, '2.50', 1),
(107, 'Tilapia', 95, '7.00', 1),
(108, 'Lettuce', 58, '2.00', 1),
(109, 'Peanut Oil', 57, '4.00', 1),
(110, 'Sardines', 33, '6.00', 1),
(111, 'Arabica Coffee', 62, '20.00', 1),
(112, 'Coconut', 89, '5.00', 1),
(113, 'Cod', 23, '8.00', 1),
(114, 'Banana', 56, '98.43', 1),
(115, 'Black Rice', 86, '6.10', 1),
(116, 'Pomegranate', 60, '6.00', 1),
(117, 'Pineapple', 70, '3.50', 1),
(118, 'Peach', 47, '4.00', 1),
(119, 'Arborio Rice', 95, '4.50', 1),
(120, 'Plum', 20, '3.85', 1),
(121, 'Sushi Rice', 19, '4.30', 1),
(122, 'Arabica Coffee', 74, '21.00', 1),
(123, 'Pear', 61, '4.50', 1),
(124, 'Sourdough Bread', 34, '4.00', 1),
(125, 'Pear', 29, '4.50', 1),
(126, 'Heavy Cream', 14, '4.20', 1),
(127, 'White Rice', 20, '1.80', 1),
(128, 'Cauliflower', 40, '3.20', 1),
(129, 'Canola Oil', 91, '2.30', 1),
(130, 'Avocado Oil', 99, '10.00', 1),
(131, 'Bread Flour', 34, '1.50', 1),
(132, 'Gouda Cheese', 100, '7.00', 1),
(133, 'Black Rice', 79, '6.00', 1),
(134, 'Greek Yogurt', 62, '3.00', 1),
(135, 'Tuna', 25, '18.00', 1),
(136, 'Buttermilk', 47, '2.50', 1),
(137, 'Orange', 15, '3.00', 1),
(138, 'Pomegranate', 19, '6.00', 1),
(139, 'Tuna', 58, '18.00', 1),
(140, 'Sour Cream', 11, '4.00', 1),
(141, 'Rice Flour', 99, '2.00', 1),
(142, 'Long Grain Rice', 26, '1.50', 1),
(143, 'Bell Pepper', 70, '4.50', 1),
(144, 'Bell Pepper', 50, '4.50', 1),
(145, 'Pineapple', 55, '3.50', 1),
(146, 'Cod', 31, '8.00', 1),
(147, 'Green Tea', 63, '8.00', 1),
(148, 'Sardines', 73, '6.00', 1),
(149, 'Sourdough Bread', 12, '4.00', 1),
(150, 'Short Grain Rice', 53, '3.00', 1),
(151, 'Powdered Sugar', 68, '2.50', 1),
(152, 'Swiss Cheese', 80, '8.10', 1),
(153, 'Tuna', 92, '18.00', 1),
(154, 'Cucumber', 31, '1.80', 1),
(155, 'Eggplant', 31, '3.00', 1),
(156, 'Garlic', 76, '7.00', 1),
(157, 'Vegetable Oil', 57, '2.00', 1),
(158, 'Whipped Cream', 92, '4.00', 1),
(159, 'Cheddar Cheese', 88, '9.00', 1),
(160, 'Coconut', 99, '5.00', 1),
(161, 'Egg (Turkey)', 44, '2.50', 1),
(162, 'Herbal Tea', 48, '31.00', 1),
(163, 'Sesame Oil', 27, '6.50', 1),
(164, 'Black Rice', 34, '6.15', 1),
(165, 'Orange', 41, '3.00', 1),
(166, 'Black Tea', 56, '5.00', 1),
(167, 'Asparagus', 22, '5.00', 1),
(168, 'Palm Oil', 40, '1.80', 1),
(169, 'Swiss Cheese', 50, '8.00', 1),
(170, 'Mango', 89, '4.80', 1),
(171, 'Egg (Turkey)', 76, '2.50', 1),
(172, 'Whole Wheat Flour', 67, '2.75', 1),
(173, 'Robusta Coffee', 62, '10.00', 1),
(174, 'Watermelon', 75, '3.00', 1),
(175, 'Green Coffee', 75, '12.50', 1),
(176, 'Cream', 29, '2.50', 1),
(177, 'Oatmeal Biscuit', 34, '5.00', 1),
(178, 'Green Tea', 15, '8.00', 1),
(179, 'Anchovies', 88, '10.00', 1),
(180, 'Cheddar Cheese', 40, '9.00', 1),
(181, 'Avocado Oil', 10, '10.00', 1),
(182, 'Arabica Coffee', 21, '21.00', 1),
(183, 'Trout', 75, '12.00', 1),
(184, 'Cod', 56, '8.00', 1),
(185, 'Rye Bread', 69, '3.00', 1),
(186, 'Basmati Rice', 56, '4.50', 1),
(187, 'White Sugar', 24, '2.00', 1),
(188, 'Sourdough Bread', 30, '4.50', 1),
(189, 'White Tea', 36, '25.00', 1),
(190, 'White Bread', 93, '2.50', 1),
(191, 'Mozzarella Cheese', 96, '7.00', 1),
(192, 'Peanut Oil', 60, '4.00', 1),
(193, 'Gouda Cheese', 97, '7.00', 1),
(194, 'Chocolate Biscuit', 11, '5.00', 1),
(195, 'Pomegranate', 14, '6.00', 1),
(196, 'Sunflower Oil', 88, '2.50', 1),
(197, 'Jasmine Rice', 24, '4.75', 1),
(198, 'Haddock', 93, '9.00', 1),
(199, 'Black Rice', 68, '6.00', 1),
(200, 'Rye Bread', 28, '2.80', 1),
(201, 'Lime', 21, '2.00', 1),
(202, 'Pomegranate', 92, '6.00', 1),
(203, 'Robusta Coffee', 68, '10.00', 1),
(204, 'Multigrain Bread', 46, '3.50', 1),
(205, 'Cucumber', 47, '1.75', 1),
(206, 'Olive Oil', 52, '6.00', 1),
(207, 'Mushrooms', 51, '6.00', 1),
(208, 'Egg (Goose)', 14, '2.50', 1),
(209, 'Greek Yogurt', 62, '51.17', 1),
(210, 'Peach', 40, '4.00', 1),
(211, 'White Tea', 50, '25.50', 1),
(212, 'Sushi Rice', 77, '4.25', 1),
(213, 'Strawberries', 31, '5.90', 1),
(214, 'Mushrooms', 35, '6.50', 1),
(215, 'Broccoli', 31, '4.00', 1),
(216, 'White Bread', 56, '2.50', 1),
(217, 'Greek Yogurt', 90, '3.00', 1),
(218, 'Canola Oil', 79, '2.30', 1),
(219, 'Lime', 29, '2.00', 1),
(220, 'Canola Oil', 46, '2.30', 1),
(221, 'Blueberries', 42, '10.00', 1),
(222, 'Mozzarella Cheese', 16, '7.20', 1),
(223, 'Tuna', 89, '18.00', 1),
(224, 'White Tea', 20, '25.00', 1),
(225, 'Black Coffee', 37, '15.00', 1),
(226, 'Bread Flour', 97, '1.50', 1),
(227, 'Feta Cheese', 98, '7.00', 1),
(228, 'Kiwi', 37, '6.00', 1),
(229, 'Digestive Biscuit', 97, '4.00', 1),
(230, 'Arabica Coffee', 97, '20.00', 1),
(231, 'Lemon', 90, '2.50', 1),
(232, 'Arabica Coffee', 46, '20.00', 1),
(233, 'Broccoli', 40, '4.00', 1),
(234, 'Kale', 77, '4.00', 1),
(235, 'Bread Flour', 62, '1.50', 1),
(236, 'Herbal Tea', 59, '30.00', 1),
(237, 'Blueberries', 23, '10.00', 1),
(238, 'Digestive Biscuit', 39, '4.00', 1),
(239, 'Gouda Cheese', 68, '7.00', 1),
(240, 'Almond Flour', 75, '9.50', 1),
(241, 'Chocolate Biscuit', 96, '5.00', 1),
(242, 'Haddock', 17, '9.00', 1),
(243, 'Egg (Duck)', 23, '1.00', 1),
(244, 'Peach', 15, '4.00', 1),
(245, 'Mackerel', 71, '7.50', 1),
(246, 'Egg (Goose)', 97, '2.50', 1),
(247, 'Zucchini', 29, '2.50', 1),
(248, 'Bell Pepper', 46, '4.60', 1),
(249, 'Cheese', 76, '9.50', 1),
(250, 'Zucchini', 59, '2.50', 1),
(251, 'Orange', 92, '3.10', 1),
(252, 'Kiwi', 28, '6.00', 1),
(253, 'Coconut', 19, '5.00', 1),
(254, 'Butter', 85, '3.00', 1),
(255, 'Bread Flour', 57, '1.50', 1),
(256, 'Broccoli', 95, '4.00', 1),
(257, 'Sushi Rice', 84, '4.50', 1),
(258, 'Rice Flour', 31, '2.00', 1),
(259, 'Pear', 41, '4.50', 1),
(260, 'Feta Cheese', 97, '7.00', 1),
(261, 'Milk', 43, '1.00', 1),
(262, 'Palm Oil', 74, '1.80', 1),
(263, 'Bread Flour', 70, '1.50', 1),
(264, 'Cheese', 69, '9.20', 1),
(265, 'Carrot', 67, '1.50', 1),
(266, 'Short Grain Rice', 18, '3.00', 1),
(267, 'Arabica Coffee', 22, '21.00', 1),
(268, 'Grapes', 88, '5.50', 1),
(269, 'Tilapia', 78, '7.00', 1),
(270, 'Olive Oil', 83, '6.00', 1),
(271, 'Robusta Coffee', 42, '10.50', 1),
(272, 'Peas', 49, '3.00', 1),
(273, 'Brown Rice', 17, '2.50', 1),
(274, 'Buttermilk', 52, '2.40', 1),
(275, 'Mushrooms', 79, '6.00', 1),
(276, 'Palm Oil', 35, '1.80', 1),
(277, 'Cucumber', 76, '1.80', 1),
(278, 'Swiss Cheese', 93, '8.00', 1),
(279, 'Halibut', 40, '20.00', 1),
(280, 'Trout', 19, '11.50', 1),
(281, 'Vegetable Oil', 70, '2.00', 1),
(282, 'Digestive Biscuit', 90, '4.00', 1),
(283, 'Digestive Biscuit', 77, '4.00', 1),
(284, 'Apricot', 38, '5.00', 1),
(285, 'Tilapia', 93, '7.00', 1),
(286, 'Evaporated Milk', 23, '2.00', 1),
(287, 'Green Tea', 51, '7.60', 1),
(288, 'Heavy Cream', 57, '4.00', 1),
(289, 'Papaya', 59, '4.50', 1),
(290, 'Blueberries', 89, '10.00', 1),
(291, 'Blueberries', 53, '10.00', 1),
(292, 'Plum', 11, '3.90', 1),
(293, 'Yogurt', 59, '1.75', 1),
(294, 'Onion', 34, '2.00', 1),
(295, 'Tuna', 25, '18.00', 1),
(296, 'Anchovies', 81, '10.00', 1),
(297, 'Apple', 81, '3.50', 1),
(298, 'Watermelon', 71, '3.00', 1),
(299, 'Cauliflower', 52, '2.50', 1),
(300, 'Greek Yogurt', 26, '3.00', 1),
(301, 'Haddock', 84, '9.00', 1),
(302, 'Blueberries', 28, '10.00', 1),
(303, 'Strawberries', 94, '6.00', 1),
(304, 'Kiwi', 47, '6.00', 1),
(305, 'Coconut Sugar', 20, '5.00', 1),
(306, 'Tomato', 84, '2.50', 1),
(307, 'Cheese', 100, '9.00', 1),
(308, 'Milk', 74, '1.00', 1),
(309, 'Green Coffee', 27, '12.00', 1),
(310, 'Eggplant', 91, '3.00', 1),
(311, 'Grapes', 82, '5.50', 1),
(312, 'Bread Flour', 84, '1.50', 1),
(313, 'Halibut', 18, '20.00', 1),
(314, 'Sourdough Bread', 12, '4.50', 1),
(315, 'Black Rice', 85, '6.50', 1),
(316, 'Butter Biscuit', 33, '6.00', 1),
(317, 'Tilapia', 59, '7.00', 1),
(318, 'Grapes', 22, '5.50', 1),
(319, 'Gouda Cheese', 67, '7.00', 1),
(320, 'Cheese', 78, '9.00', 1),
(321, 'Lemon', 72, '2.45', 1),
(322, 'Heavy Cream', 63, '4.00', 1),
(323, 'White Bread', 30, '2.50', 1),
(324, 'Arabica Coffee', 36, '20.00', 1),
(325, 'Grapes', 88, '5.50', 1),
(326, 'Banana', 95, '53.82', 1),
(327, 'Broccoli', 30, '4.00', 1),
(328, 'Green Beans', 31, '2.00', 1),
(329, 'Cod', 16, '8.00', 1),
(330, 'White Sugar', 14, '2.00', 1),
(331, 'Tomato', 44, '2.50', 1),
(332, 'Long Grain Rice', 69, '1.50', 1),
(333, 'Long Grain Rice', 71, '1.50', 1),
(334, 'Carrot', 92, '1.60', 1),
(335, 'Peanut Oil', 49, '4.00', 1),
(336, 'Pomegranate', 52, '6.00', 1),
(337, 'Egg (Turkey)', 56, '2.50', 1),
(338, 'Strawberries', 16, '6.10', 1),
(339, 'Zucchini', 52, '2.50', 1),
(340, 'Trout', 91, '11.50', 1),
(341, 'Mango', 58, '4.70', 1),
(342, 'Halibut', 47, '20.00', 1),
(343, 'Rye Bread', 50, '3.00', 1),
(344, 'Sour Cream', 43, '4.00', 1),
(345, 'Cheddar Cheese', 68, '8.90', 1),
(346, 'Egg (Turkey)', 19, '2.50', 1),
(347, 'Swiss Cheese', 70, '8.00', 1),
(348, 'Eggplant', 97, '3.00', 1),
(349, 'Sunflower Oil', 87, '2.50', 1),
(350, 'White Tea', 58, '25.00', 1),
(351, 'Coconut', 16, '5.00', 1),
(352, 'Pineapple', 65, '3.50', 1),
(353, 'Basmati Rice', 15, '4.50', 1),
(354, 'Bell Pepper', 75, '4.50', 1),
(355, 'Vanilla Biscuit', 80, '5.50', 1),
(356, 'Orange', 84, '2.85', 1),
(357, 'Eggplant', 17, '3.00', 1),
(358, 'Evaporated Milk', 64, '1.90', 1),
(359, 'Whipped Cream', 76, '4.00', 1),
(360, 'Sesame Oil', 77, '6.50', 1),
(361, 'Cream', 18, '2.50', 1),
(362, 'Coconut Sugar', 51, '5.00', 1),
(363, 'Asparagus', 68, '5.00', 1),
(364, 'Wild Rice', 46, '10.00', 1),
(365, 'Long Grain Rice', 98, '1.50', 1),
(366, 'Onion', 50, '2.00', 1),
(367, 'Salmon', 88, '15.00', 1),
(368, 'Potato', 26, '1.20', 1),
(369, 'Green Coffee', 43, '12.00', 1),
(370, 'Powdered Sugar', 46, '2.50', 1),
(371, 'Cauliflower', 19, '2.45', 1),
(372, 'Kale', 61, '4.00', 1),
(373, 'Garlic', 43, '7.00', 1),
(374, 'Green Tea', 80, '8.50', 1),
(375, 'Green Tea', 34, '8.00', 1),
(376, 'Green Tea', 88, '8.00', 1),
(377, 'Cottage Cheese', 89, '5.00', 1),
(378, 'Wild Rice', 26, '10.00', 1),
(379, 'Pear', 26, '4.50', 1),
(380, 'Peach', 37, '4.00', 1),
(381, 'Yogurt', 76, '1.75', 1),
(382, 'Feta Cheese', 80, '7.00', 1),
(383, 'Sweet Potato', 100, '2.00', 1),
(384, 'Butter', 21, '3.10', 1),
(385, 'Coconut Oil', 33, '5.00', 1),
(386, 'Apple', 43, '3.50', 1),
(387, 'Mushrooms', 34, '6.20', 1),
(388, 'Mackerel', 82, '7.50', 1),
(389, 'Whole Wheat Bread', 17, '3.50', 1),
(390, 'Sushi Rice', 36, '4.75', 1),
(391, 'Cod', 65, '8.00', 1),
(392, 'Papaya', 45, '4.50', 1),
(393, 'Egg (Goose)', 35, '2.50', 1),
(394, 'Bread Flour', 96, '1.50', 1),
(395, 'Coconut', 56, '5.00', 1),
(396, 'Ricotta Cheese', 49, '6.00', 1),
(397, 'Raw Sugar', 100, '1.50', 1),
(398, 'Haddock', 30, '9.00', 1),
(399, 'Papaya', 20, '4.50', 1),
(400, 'Sesame Oil', 85, '6.50', 1),
(401, 'Green Beans', 86, '2.10', 1),
(402, 'Sourdough Bread', 65, '4.00', 1),
(403, 'Cottage Cheese', 67, '5.00', 1),
(404, 'Ricotta Cheese', 88, '6.00', 1),
(405, 'Robusta Coffee', 14, '10.00', 1),
(406, 'Tilapia', 85, '6.70', 1),
(407, 'Feta Cheese', 74, '7.00', 1),
(408, 'Cheddar Cheese', 21, '9.00', 1),
(409, 'Butter Biscuit', 22, '6.00', 1),
(410, 'Ricotta Cheese', 91, '6.00', 1),
(411, 'Multigrain Bread', 85, '3.50', 1),
(412, 'Peas', 12, '3.00', 1),
(413, 'Pomegranate', 43, '6.00', 1),
(414, 'Yogurt', 92, '1.75', 1),
(415, 'Watermelon', 23, '3.00', 1),
(416, 'Egg (Duck)', 77, '1.00', 1),
(417, 'Sweet Potato', 65, '2.00', 1),
(418, 'Banana', 82, '15.31', 1),
(419, 'Swiss Cheese', 20, '8.00', 1),
(420, 'Cheddar Cheese', 31, '9.00', 1),
(421, 'Butter', 36, '2.90', 1),
(422, 'Black Tea', 59, '5.00', 1),
(423, 'Long Grain Rice', 11, '1.50', 1),
(424, 'Black Coffee', 24, '15.50', 1),
(425, 'Haddock', 75, '9.00', 1),
(426, 'Black Coffee', 11, '15.00', 1),
(427, 'Anchovies', 60, '10.00', 1),
(428, 'Lemon', 91, '2.40', 1),
(429, 'Egg (Goose)', 43, '2.50', 1),
(430, 'Bread Flour', 25, '1.50', 1),
(431, 'Parmesan Cheese', 96, '11.80', 1),
(432, 'Mackerel', 30, '7.50', 1),
(433, 'Arborio Rice', 56, '4.50', 1),
(434, 'Whole Wheat Bread', 91, '3.50', 1),
(435, 'White Sugar', 27, '2.00', 1),
(436, 'Buttermilk', 28, '2.45', 1),
(437, 'Sour Cream', 92, '4.00', 1),
(438, 'Tuna', 37, '18.00', 1),
(439, 'Powdered Sugar', 28, '2.50', 1),
(440, 'Tilapia', 30, '7.00', 1),
(441, 'Arabica Coffee', 98, '20.00', 1),
(442, 'Lemon', 65, '2.50', 1),
(443, 'Rice Flour', 42, '2.00', 1),
(444, 'Lemon', 63, '2.50', 1),
(445, 'Broccoli', 85, '4.00', 1),
(446, 'Egg (Duck)', 44, '1.00', 1),
(447, 'Plum', 26, '4.00', 1),
(448, 'Coconut Sugar', 49, '5.00', 1),
(449, 'Pomegranate', 59, '6.00', 1),
(450, 'Raw Sugar', 19, '1.50', 1),
(451, 'Eggplant', 47, '3.00', 1),
(452, 'Grapes', 98, '5.50', 1),
(453, 'Watermelon', 51, '3.00', 1),
(454, 'Anchovies', 100, '10.00', 1),
(455, 'Yogurt', 55, '1.70', 1),
(456, 'Whipped Cream', 14, '4.00', 1),
(457, 'Egg (Quail)', 29, '0.80', 1),
(458, 'Chocolate Biscuit', 100, '5.00', 1),
(459, 'Ricotta Cheese', 49, '6.00', 1),
(460, 'Vegetable Oil', 75, '2.00', 1),
(461, 'Heavy Cream', 82, '4.10', 1),
(462, 'Cottage Cheese', 68, '4.80', 1),
(463, 'Corn Oil', 70, '2.50', 1),
(464, 'Salmon', 49, '15.00', 1),
(465, 'Mackerel', 89, '7.50', 1),
(466, 'Cheese', 88, '9.00', 1),
(467, 'Green Tea', 39, '8.00', 1),
(468, 'Cauliflower', 87, '2.50', 1),
(469, 'Oatmeal Biscuit', 93, '5.00', 1),
(470, 'Egg (Turkey)', 23, '2.40', 1),
(471, 'Vanilla Biscuit', 94, '5.50', 1),
(472, 'Digestive Biscuit', 38, '4.00', 1),
(473, 'Evaporated Milk', 11, '2.00', 1),
(474, 'White Tea', 60, '25.30', 1),
(475, 'Avocado Oil', 50, '10.00', 1),
(476, 'Egg (Goose)', 90, '2.50', 1),
(477, 'Arborio Rice', 86, '4.50', 1),
(478, 'Cauliflower', 86, '2.50', 1),
(479, 'Almond Flour', 54, '9.50', 1),
(480, 'Watermelon', 27, '3.00', 1),
(481, 'Rye Bread', 50, '3.00', 1),
(482, 'Onion', 68, '2.00', 1),
(483, 'Sourdough Bread', 22, '4.20', 1),
(484, 'Cheese', 50, '9.20', 1),
(485, 'Bell Pepper', 26, '4.40', 1),
(486, 'White Tea', 62, '25.00', 1),
(487, 'Broccoli', 79, '4.00', 1),
(488, 'Peach', 73, '4.00', 1),
(489, 'Carrot', 18, '1.45', 1),
(490, 'Kale', 79, '4.00', 1),
(491, 'Arabica Coffee', 23, '20.00', 1),
(492, 'Milk', 18, '1.00', 1),
(493, 'Sunflower Oil', 24, '2.50', 1),
(494, 'Watermelon', 53, '3.00', 1),
(495, 'Yogurt', 85, '1.75', 1),
(496, 'Sesame Oil', 15, '6.50', 1),
(497, 'Anchovies', 66, '10.00', 1),
(498, 'Corn Oil', 17, '2.50', 1),
(499, 'Grapes', 13, '5.50', 1),
(500, 'Digestive Biscuit', 34, '4.00', 1),
(501, 'Swiss Cheese', 85, '8.00', 1),
(502, 'Cabbage', 12, '1.00', 1),
(503, 'Oatmeal Biscuit', 82, '5.00', 1),
(504, 'Sourdough Bread', 71, '4.00', 1),
(505, 'Mozzarella Cheese', 58, '7.00', 1),
(506, 'Rice Flour', 15, '2.00', 1),
(507, 'Pineapple', 68, '3.50', 1),
(508, 'White Sugar', 13, '2.00', 1),
(509, 'Sesame Oil', 45, '6.50', 1),
(510, 'Egg (Goose)', 40, '2.45', 1),
(511, 'Black Coffee', 62, '15.50', 1),
(512, 'Peanut Oil', 79, '4.00', 1),
(513, 'Peas', 75, '3.00', 1),
(514, 'Almond Flour', 76, '9.50', 1),
(515, 'Canola Oil', 96, '2.30', 1),
(516, 'Canola Oil', 69, '2.30', 1),
(517, 'Butter', 48, '3.00', 1),
(518, 'Cream', 82, '2.40', 1),
(519, 'Zucchini', 43, '2.50', 1),
(520, 'Green Coffee', 90, '12.00', 1),
(521, 'Milk', 13, '0.90', 1),
(522, 'Cabbage', 62, '1.00', 1),
(523, 'Coconut Sugar', 17, '5.00', 1),
(524, 'Sesame Oil', 100, '6.50', 1),
(525, 'All-Purpose Flour', 54, '1.75', 1),
(526, 'Whipped Cream', 98, '4.10', 1),
(527, 'Herbal Tea', 20, '30.50', 1),
(528, 'Haddock', 43, '9.00', 1),
(529, 'Green Coffee', 29, '12.00', 1),
(530, 'Grapes', 37, '5.50', 1),
(531, 'Cheddar Cheese', 85, '8.90', 1),
(532, 'Basmati Rice', 26, '4.40', 1),
(533, 'White Tea', 91, '25.00', 1),
(534, 'Ricotta Cheese', 50, '6.20', 1),
(535, 'Trout', 98, '12.00', 1),
(536, 'Egg (Duck)', 37, '1.00', 1),
(537, 'White Bread', 78, '2.50', 1),
(538, 'Cauliflower', 48, '2.55', 1),
(539, 'Arabica Coffee', 74, '20.00', 1),
(540, 'Pineapple', 18, '3.50', 1),
(541, 'Cauliflower', 95, '2.48', 1),
(542, 'Egg (Turkey)', 39, '2.50', 1),
(543, 'Peas', 48, '3.00', 1),
(544, 'Strawberries', 58, '5.90', 1),
(545, 'Greek Yogurt', 39, '3.00', 1),
(546, 'Papaya', 84, '4.40', 1),
(547, 'Sardines', 30, '6.00', 1),
(548, 'Sesame Oil', 14, '6.50', 1),
(549, 'Powdered Sugar', 21, '2.50', 1),
(550, 'Jasmine Rice', 17, '4.75', 1),
(551, 'Cauliflower', 34, '2.50', 1),
(552, 'Jasmine Rice', 56, '4.75', 1),
(553, 'Plum', 64, '3.90', 1),
(554, 'Grapes', 87, '5.50', 1),
(555, 'Papaya', 24, '4.50', 1),
(556, 'Sushi Rice', 47, '4.20', 1),
(557, 'Digestive Biscuit', 61, '4.00', 1),
(558, 'Rye Bread', 48, '2.80', 1),
(559, 'Chocolate Biscuit', 37, '5.00', 1),
(560, 'Arabica Coffee', 45, '20.00', 1),
(561, 'Bread Flour', 87, '1.50', 1),
(562, 'Almond Flour', 37, '9.50', 1),
(563, 'Robusta Coffee', 59, '10.30', 1),
(564, 'Pomegranate', 62, '6.00', 1),
(565, 'Yogurt', 63, '1.70', 1),
(566, 'Grapes', 38, '5.50', 1),
(567, 'Mackerel', 76, '7.50', 1),
(568, 'Egg (Quail)', 34, '0.80', 1),
(569, 'Eggplant', 25, '3.00', 1),
(570, 'Egg (Turkey)', 86, '2.50', 1),
(571, 'Oatmeal Biscuit', 41, '5.00', 1),
(572, 'Cauliflower', 77, '2.50', 1),
(573, 'Egg (Duck)', 41, '1.00', 1),
(574, 'Orange', 44, '2.95', 1),
(575, 'Avocado Oil', 53, '10.00', 1),
(576, 'Chocolate Biscuit', 68, '5.00', 1),
(577, 'Swiss Cheese', 96, '8.00', 1),
(578, 'Garlic', 33, '7.00', 1),
(579, 'Cauliflower', 33, '2.50', 1),
(580, 'Watermelon', 90, '3.00', 1),
(581, 'Brown Rice', 31, '2.50', 1),
(582, 'Asparagus', 92, '5.00', 1),
(583, 'Cauliflower', 66, '2.50', 1),
(584, 'Anchovies', 83, '10.00', 1),
(585, 'Mango', 84, '5.00', 1),
(586, 'Haddock', 76, '9.00', 1),
(587, 'Pomegranate', 26, '6.00', 1),
(588, 'Green Coffee', 61, '12.50', 1),
(589, 'Evaporated Milk', 15, '1.90', 1),
(590, 'Apricot', 73, '5.00', 1),
(591, 'Whole Wheat Flour', 41, '2.65', 1),
(592, 'Avocado Oil', 14, '10.00', 1),
(593, 'Mango', 99, '5.00', 1),
(594, 'Asparagus', 80, '5.00', 1),
(595, 'Eggplant', 49, '3.00', 1),
(596, 'Grapes', 25, '5.50', 1),
(597, 'Sesame Oil', 39, '6.50', 1),
(598, 'Orange', 94, '2.90', 1),
(599, 'Sardines', 11, '6.00', 1),
(600, 'Peanut Oil', 21, '4.00', 1),
(601, 'Kiwi', 38, '5.70', 1),
(602, 'Palm Oil', 58, '1.80', 1),
(603, 'Plum', 85, '3.85', 1),
(604, 'Cauliflower', 63, '2.50', 1),
(605, 'Coconut Oil', 54, '5.00', 1),
(606, 'Cherry', 30, '8.00', 1),
(607, 'Cauliflower', 57, '2.50', 1),
(608, 'Vegetable Oil', 18, '2.00', 1),
(609, 'Tuna', 16, '18.00', 1),
(610, 'Buttermilk', 39, '2.50', 1),
(611, 'Lemon', 59, '2.45', 1),
(612, 'Salmon', 79, '15.00', 1),
(613, 'Egg (Quail)', 78, '0.80', 1),
(614, 'Sushi Rice', 22, '4.25', 1),
(615, 'Egg (Chicken)', 10, '0.20', 1),
(616, 'Arborio Rice', 34, '4.50', 1),
(617, 'Heavy Cream', 74, '4.00', 1),
(618, 'Sushi Rice', 10, '4.30', 1),
(619, 'Basmati Rice', 11, '4.50', 1),
(620, 'Grapes', 99, '5.50', 1),
(621, 'Swiss Cheese', 64, '8.00', 1),
(622, 'Pear', 58, '4.45', 1),
(623, 'Corn Oil', 26, '2.50', 1),
(624, 'Raw Sugar', 72, '1.50', 1),
(625, 'Mozzarella Cheese', 36, '7.10', 1),
(626, 'Mushrooms', 24, '6.00', 1),
(627, 'Onion', 16, '2.00', 1),
(628, 'Banana', 39, '13.99', 1),
(629, 'Zucchini', 89, '2.50', 1),
(630, 'Cherry', 57, '8.00', 1),
(631, 'Herbal Tea', 61, '30.00', 1),
(632, 'Short Grain Rice', 56, '3.00', 1),
(633, 'Cream', 21, '2.35', 1),
(634, 'Grapes', 59, '5.50', 1),
(635, 'Green Coffee', 20, '12.00', 1),
(636, 'Rye Bread', 99, '3.00', 1),
(637, 'Green Tea', 24, '8.00', 1),
(638, 'Sushi Rice', 78, '4.35', 1),
(639, 'Egg (Duck)', 52, '1.00', 1),
(640, 'Spinach', 45, '2.45', 1),
(641, 'Apricot', 89, '5.00', 1),
(642, 'Kiwi', 63, '5.80', 1),
(643, 'Black Rice', 49, '6.25', 1),
(644, 'Green Tea', 26, '8.00', 1),
(645, 'Egg (Quail)', 93, '0.80', 1),
(646, 'Papaya', 81, '4.30', 1),
(647, 'Heavy Cream', 74, '4.00', 1),
(648, 'Black Tea', 19, '5.00', 1),
(649, 'Short Grain Rice', 64, '3.00', 1),
(650, 'Bell Pepper', 49, '4.50', 1),
(651, 'Parmesan Cheese', 99, '12.00', 1),
(652, 'Buttermilk', 60, '2.45', 1),
(653, 'Cabbage', 90, '0.90', 1),
(654, 'Haddock', 79, '9.00', 1),
(655, 'Egg (Chicken)', 22, '0.20', 1),
(656, 'Brown Rice', 51, '2.50', 1),
(657, 'Arabica Coffee', 65, '20.00', 1),
(658, 'Whipped Cream', 55, '4.00', 1),
(659, 'White Rice', 18, '1.80', 1),
(660, 'Parmesan Cheese', 37, '12.00', 1),
(661, 'Salmon', 88, '15.00', 1),
(662, 'Pineapple', 20, '3.50', 1),
(663, 'Bread Flour', 99, '1.50', 1),
(664, 'Asparagus', 46, '4.80', 1),
(665, 'Wild Rice', 19, '10.00', 1),
(666, 'Yogurt', 12, '1.75', 1),
(667, 'Buttermilk', 69, '2.55', 1),
(668, 'Egg (Duck)', 63, '1.00', 1),
(669, 'Asparagus', 78, '4.70', 1),
(670, 'White Bread', 72, '2.50', 1),
(671, 'Wild Rice', 58, '10.00', 1),
(672, 'Egg (Goose)', 88, '2.50', 1),
(673, 'White Rice', 54, '1.80', 1),
(674, 'Powdered Sugar', 64, '2.50', 1),
(675, 'Milk', 12, '1.00', 1),
(676, 'Mango', 61, '5.20', 1),
(677, 'Oatmeal Biscuit', 28, '5.00', 1),
(678, 'Spinach', 23, '2.50', 1),
(679, 'Blueberries', 87, '10.00', 1),
(680, 'Robusta Coffee', 59, '10.00', 1),
(681, 'Watermelon', 13, '3.00', 1),
(682, 'Pomegranate', 81, '6.00', 1),
(683, 'White Bread', 61, '2.50', 1),
(684, 'Carrot', 80, '1.50', 1),
(685, 'Brown Rice', 39, '2.50', 1),
(686, 'Cabbage', 69, '66.55', 1),
(687, 'Egg (Goose)', 60, '2.50', 1),
(688, 'Sour Cream', 22, '4.10', 1),
(689, 'Almond Flour', 79, '9.50', 1),
(690, 'Broccoli', 47, '4.00', 1),
(691, 'Jasmine Rice', 20, '4.75', 1),
(692, 'Gouda Cheese', 41, '7.00', 1),
(693, 'Tilapia', 46, '7.00', 1),
(694, 'Palm Oil', 67, '1.80', 1),
(695, 'Arborio Rice', 51, '4.50', 1),
(696, 'White Sugar', 42, '2.00', 1),
(697, 'Sesame Oil', 85, '6.50', 1),
(698, 'Sunflower Oil', 23, '2.50', 1),
(699, 'Bell Pepper', 84, '4.50', 1),
(700, 'Greek Yogurt', 28, '42.58', 1),
(701, 'White Bread', 62, '2.50', 1),
(702, 'Egg (Goose)', 65, '2.50', 1),
(703, 'Lime', 18, '2.00', 1),
(704, 'Egg (Chicken)', 70, '0.20', 1),
(705, 'Vegetable Oil', 23, '2.00', 1),
(706, 'Jasmine Rice', 26, '4.75', 1),
(707, 'Robusta Coffee', 20, '10.00', 1),
(708, 'Mozzarella Cheese', 55, '7.20', 1),
(709, 'Whole Wheat Flour', 82, '2.75', 1),
(710, 'Salmon', 73, '15.00', 1),
(711, 'White Tea', 81, '25.00', 1),
(712, 'Onion', 20, '2.00', 1),
(713, 'Black Coffee', 78, '15.00', 1),
(714, 'Butter Biscuit', 84, '6.00', 1),
(715, 'Corn Oil', 32, '2.50', 1),
(716, 'Coconut Oil', 90, '5.00', 1),
(717, 'Evaporated Milk', 70, '2.00', 1),
(718, 'Bell Pepper', 90, '4.50', 1),
(719, 'Lettuce', 100, '2.00', 1),
(720, 'Brown Rice', 89, '2.50', 1),
(721, 'Whole Wheat Flour', 38, '2.70', 1),
(722, 'Rye Bread', 61, '3.00', 1),
(723, 'Orange', 75, '3.00', 1),
(724, 'Multigrain Bread', 87, '3.20', 1),
(725, 'Bread Flour', 71, '1.50', 1),
(726, 'Haddock', 98, '9.00', 1),
(727, 'Green Beans', 19, '2.00', 1),
(728, 'Coconut', 85, '5.00', 1),
(729, 'Apple', 71, '3.50', 1),
(730, 'Brown Rice', 44, '2.50', 1),
(731, 'Rice Flour', 25, '2.00', 1),
(732, 'Peanut Oil', 24, '4.00', 1),
(733, 'Anchovies', 44, '10.00', 1),
(734, 'Powdered Sugar', 63, '2.50', 1),
(735, 'Palm Oil', 69, '1.80', 1),
(736, 'Tuna', 88, '18.00', 1),
(737, 'Robusta Coffee', 74, '10.00', 1),
(738, 'Bell Pepper', 98, '4.50', 1),
(739, 'Egg (Chicken)', 22, '0.20', 1),
(740, 'Apricot', 55, '5.00', 1),
(741, 'Ricotta Cheese', 96, '6.10', 1),
(742, 'Feta Cheese', 91, '7.00', 1),
(743, 'Digestive Biscuit', 40, '4.00', 1),
(744, 'Salmon', 52, '15.00', 1),
(745, 'Lettuce', 22, '2.00', 1),
(746, 'Black Rice', 98, '6.35', 1),
(747, 'Whole Wheat Flour', 59, '2.75', 1),
(748, 'Chocolate Biscuit', 99, '5.00', 1),
(749, 'Black Tea', 18, '5.30', 1),
(750, 'Watermelon', 58, '3.00', 1),
(751, 'Black Rice', 30, '6.30', 1),
(752, 'Papaya', 97, '4.50', 1),
(753, 'Egg (Goose)', 50, '2.45', 1),
(754, 'Cheddar Cheese', 70, '9.00', 1),
(755, 'Blueberries', 40, '10.00', 1),
(756, 'Corn Oil', 75, '2.50', 1),
(757, 'Strawberries', 26, '6.00', 1),
(758, 'Arabica Coffee', 13, '20.00', 1),
(759, 'Plum', 11, '4.00', 1),
(760, 'Salmon', 98, '15.00', 1),
(761, 'Broccoli', 35, '4.00', 1),
(762, 'Mackerel', 45, '7.50', 1),
(763, 'Kale', 47, '4.00', 1),
(764, 'Sesame Oil', 89, '6.50', 1),
(765, 'Black Coffee', 33, '15.00', 1),
(766, 'Apricot', 90, '5.00', 1),
(767, 'Jasmine Rice', 44, '4.75', 1),
(768, 'Wild Rice', 41, '9.75', 1),
(769, 'Potato', 72, '1.20', 1),
(770, 'Egg (Goose)', 72, '2.40', 1),
(771, 'Black Coffee', 40, '15.00', 1),
(772, 'Whole Wheat Bread', 36, '3.50', 1),
(773, 'Vegetable Oil', 51, '2.00', 1),
(774, 'Black Coffee', 87, '14.90', 1),
(775, 'Pear', 79, '4.50', 1),
(776, 'Tilapia', 14, '6.80', 1),
(777, 'Orange', 81, '3.00', 1),
(778, 'Lime', 75, '2.00', 1),
(779, 'Gouda Cheese', 48, '7.00', 1),
(780, 'Onion', 50, '2.00', 1),
(781, 'Haddock', 11, '9.00', 1),
(782, 'Almond Flour', 74, '9.50', 1),
(783, 'Tomato', 11, '2.50', 1),
(784, 'Heavy Cream', 85, '4.00', 1),
(785, 'Cauliflower', 57, '2.50', 1),
(786, 'Lime', 75, '1.90', 1),
(787, 'Egg (Turkey)', 63, '2.35', 1),
(788, 'White Tea', 35, '25.25', 1),
(789, 'Cabbage', 24, '1.00', 1),
(790, 'Jasmine Rice', 53, '4.75', 1),
(791, 'Butter Biscuit', 74, '6.00', 1),
(792, 'Brown Rice', 79, '2.50', 1),
(793, 'Bread Flour', 54, '1.50', 1),
(794, 'Palm Oil', 44, '1.80', 1),
(795, 'Almond Flour', 77, '9.50', 1),
(796, 'Apricot', 42, '5.00', 1),
(797, 'Sweet Potato', 44, '2.00', 1),
(798, 'Sour Cream', 81, '4.00', 1),
(799, 'Black Rice', 92, '6.25', 1),
(800, 'Salmon', 78, '15.00', 1),
(801, 'Heavy Cream', 85, '4.20', 1),
(802, 'Pomegranate', 65, '6.00', 1),
(803, 'Olive Oil', 36, '6.00', 1),
(804, 'Potato', 26, '1.20', 1),
(805, 'Sunflower Oil', 39, '2.50', 1),
(806, 'White Sugar', 39, '2.00', 1),
(807, 'Cabbage', 83, '1.00', 1),
(808, 'Cucumber', 28, '1.80', 1),
(809, 'Tuna', 85, '18.00', 1),
(810, 'Lime', 76, '2.00', 1),
(811, 'Tomato', 100, '2.50', 1),
(812, 'Pomegranate', 17, '6.00', 1),
(813, 'Anchovies', 51, '10.00', 1),
(814, 'Grapes', 54, '5.50', 1),
(815, 'Sourdough Bread', 94, '4.00', 1),
(816, 'Asparagus', 34, '5.00', 1),
(817, 'Herbal Tea', 27, '30.00', 1),
(818, 'All-Purpose Flour', 50, '1.75', 1),
(819, 'Almond Flour', 85, '9.50', 1),
(820, 'Rice Flour', 24, '2.00', 1),
(821, 'Halibut', 82, '20.00', 1),
(822, 'Apple', 17, '3.50', 1),
(823, 'Canola Oil', 25, '2.30', 1),
(824, 'Tilapia', 56, '7.00', 1),
(825, 'Evaporated Milk', 72, '2.00', 1),
(826, 'Mushrooms', 65, '6.30', 1),
(827, 'Grapes', 30, '5.50', 1),
(828, 'Onion', 39, '2.00', 1),
(829, 'Pineapple', 14, '3.50', 1),
(830, 'Carrot', 74, '1.50', 1),
(831, 'Parmesan Cheese', 63, '11.90', 1),
(832, 'Peach', 47, '4.00', 1),
(833, 'Egg (Turkey)', 42, '2.50', 1),
(834, 'Tomato', 32, '2.50', 1),
(835, 'Lettuce', 88, '2.00', 1),
(836, 'Yogurt', 80, '1.75', 1),
(837, 'Orange', 36, '3.00', 1),
(838, 'Bread Flour', 11, '1.50', 1),
(839, 'Peach', 40, '4.00', 1),
(840, 'Bread Flour', 63, '1.50', 1),
(841, 'Raw Sugar', 90, '1.50', 1),
(842, 'Multigrain Bread', 47, '3.25', 1),
(843, 'Digestive Biscuit', 29, '4.00', 1),
(844, 'Peach', 94, '4.00', 1),
(845, 'Mango', 32, '4.90', 1),
(846, 'Plum', 40, '4.00', 1),
(847, 'Egg (Goose)', 50, '2.50', 1),
(848, 'Cod', 72, '8.00', 1),
(849, 'Pomegranate', 22, '6.00', 1),
(850, 'Chocolate Biscuit', 23, '5.00', 1),
(851, 'Halibut', 35, '20.00', 1),
(852, 'Cucumber', 12, '1.75', 1),
(853, 'Cheddar Cheese', 86, '9.00', 1),
(854, 'Mackerel', 91, '7.50', 1),
(855, 'Evaporated Milk', 23, '2.00', 1),
(856, 'Onion', 98, '2.00', 1),
(857, 'Cherry', 29, '8.00', 1),
(858, 'Coconut', 32, '5.00', 1),
(859, 'Pear', 84, '4.50', 1),
(860, 'Yogurt', 86, '1.75', 1),
(861, 'Black Rice', 11, '6.20', 1),
(862, 'Whole Wheat Flour', 60, '2.75', 1),
(863, 'Whole Wheat Bread', 58, '3.50', 1),
(864, 'Ricotta Cheese', 64, '6.00', 1),
(865, 'Canola Oil', 19, '2.30', 1),
(866, 'Cherry', 43, '8.00', 1),
(867, 'Peanut Oil', 38, '4.00', 1),
(868, 'Buttermilk', 70, '2.50', 1),
(869, 'Asparagus', 18, '5.00', 1),
(870, 'Brown Rice', 46, '2.50', 1),
(871, 'Arabica Coffee', 78, '20.50', 1),
(872, 'Canola Oil', 53, '2.30', 1),
(873, 'Haddock', 67, '9.00', 1),
(874, 'Egg (Chicken)', 36, '0.20', 1),
(875, 'Whole Wheat Flour', 39, '2.75', 1),
(876, 'Sweet Potato', 95, '2.00', 1),
(877, 'Almond Flour', 12, '9.50', 1),
(878, 'Wild Rice', 98, '10.00', 1),
(879, 'Jasmine Rice', 50, '4.75', 1),
(880, 'Zucchini', 98, '2.50', 1),
(881, 'Corn Oil', 28, '2.50', 1),
(882, 'Cucumber', 67, '1.80', 1),
(883, 'Onion', 20, '2.00', 1),
(884, 'Trout', 67, '11.60', 1),
(885, 'Egg (Quail)', 94, '0.80', 1),
(886, 'Black Tea', 45, '5.00', 1),
(887, 'Anchovies', 86, '10.00', 1),
(888, 'Wild Rice', 72, '9.75', 1),
(889, 'Green Beans', 31, '2.10', 1),
(890, 'Butter Biscuit', 12, '6.00', 1),
(891, 'Gouda Cheese', 71, '7.00', 1),
(892, 'Anchovies', 64, '10.00', 1),
(893, 'Coconut Oil', 89, '5.00', 1),
(894, 'Sesame Oil', 50, '6.50', 1),
(895, 'Mango', 53, '5.00', 1),
(896, 'Haddock', 19, '9.00', 1),
(897, 'Broccoli', 89, '4.00', 1),
(898, 'Cod', 96, '8.00', 1),
(899, 'Parmesan Cheese', 52, '12.00', 1),
(900, 'Sesame Oil', 97, '6.50', 1),
(901, 'Halibut', 88, '20.00', 1),
(902, 'Jasmine Rice', 33, '4.75', 1),
(903, 'Jasmine Rice', 98, '4.75', 1),
(904, 'Peach', 45, '4.00', 1),
(905, 'White Rice', 80, '1.80', 1),
(906, 'Halibut', 68, '20.00', 1),
(907, 'Apricot', 90, '5.00', 1),
(908, 'Trout', 89, '12.00', 1),
(909, 'Cucumber', 38, '1.80', 1),
(910, 'Green Beans', 99, '2.10', 1),
(911, 'Powdered Sugar', 66, '2.40', 1),
(912, 'Pomegranate', 66, '6.00', 1),
(913, 'Bread Flour', 64, '1.50', 1),
(914, 'Black Rice', 18, '6.00', 1),
(915, 'Whole Wheat Flour', 86, '2.75', 1),
(916, 'Black Tea', 35, '4.70', 1),
(917, 'Green Beans', 26, '2.00', 1),
(918, 'Parmesan Cheese', 80, '12.00', 1),
(919, 'Zucchini', 63, '2.50', 1),
(920, 'Vanilla Biscuit', 89, '5.50', 1),
(921, 'Sweet Potato', 80, '2.00', 1),
(922, 'Vegetable Oil', 41, '2.00', 1),
(923, 'Chocolate Biscuit', 53, '5.00', 1),
(924, 'Haddock', 61, '9.00', 1),
(925, 'Egg (Duck)', 70, '1.00', 1),
(926, 'Mango', 73, '5.00', 1),
(927, 'Kale', 60, '4.00', 1),
(928, 'Pomegranate', 88, '6.00', 1),
(929, 'Cauliflower', 95, '2.50', 1),
(930, 'Powdered Sugar', 47, '2.50', 1),
(931, 'Mozzarella Cheese', 24, '7.00', 1),
(932, 'Anchovies', 93, '10.00', 1),
(933, 'Sunflower Oil', 80, '2.50', 1),
(934, 'Apple', 77, '3.50', 1),
(935, 'Green Beans', 42, '2.00', 1),
(936, 'Egg (Turkey)', 92, '2.50', 1),
(937, 'Mushrooms', 81, '6.25', 1),
(938, 'Jasmine Rice', 46, '4.75', 1),
(939, 'Brown Rice', 44, '2.50', 1),
(940, 'Multigrain Bread', 38, '3.50', 1),
(941, 'Evaporated Milk', 64, '2.00', 1),
(942, 'Long Grain Rice', 39, '1.45', 1),
(943, 'White Bread', 42, '2.50', 1),
(944, 'White Sugar', 29, '2.00', 1),
(945, 'Cucumber', 60, '1.80', 1),
(946, 'Parmesan Cheese', 65, '12.00', 1),
(947, 'Bell Pepper', 89, '4.50', 1),
(948, 'Corn Oil', 50, '2.50', 1),
(949, 'Bell Pepper', 94, '4.50', 1),
(950, 'Canola Oil', 97, '2.30', 1),
(951, 'Digestive Biscuit', 72, '4.00', 1),
(952, 'Cream', 62, '2.50', 1),
(953, 'Apple', 44, '3.50', 1),
(954, 'Peanut Oil', 21, '4.00', 1),
(955, 'Coconut Sugar', 91, '5.00', 1),
(956, 'Tuna', 87, '18.00', 1),
(957, 'Spinach', 61, '2.52', 1),
(958, 'Carrot', 61, '1.50', 1),
(959, 'Sweet Potato', 49, '2.00', 1),
(960, 'Lemon', 87, '2.50', 1),
(961, 'Multigrain Bread', 93, '3.25', 1),
(962, 'Basmati Rice', 55, '4.45', 1),
(963, 'Sour Cream', 29, '4.00', 1),
(964, 'Egg (Chicken)', 63, '0.20', 1),
(965, 'Potato', 42, '1.20', 1),
(966, 'Onion', 74, '2.00', 1),
(967, 'Short Grain Rice', 22, '3.00', 1),
(968, 'Egg (Chicken)', 83, '0.20', 1),
(969, 'Wild Rice', 32, '10.00', 1),
(970, 'Apple', 84, '3.50', 1),
(971, 'Plum', 22, '4.00', 1),
(972, 'Peas', 100, '3.00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `Item_R2`
--

CREATE TABLE `Item_R2` (
  `Name` varchar(255) NOT NULL,
  `Category` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Item_R2`
--

INSERT INTO `Item_R2` (`Name`, `Category`) VALUES
('All-Purpose Flour', 'Grains & Pulses'),
('Almond Flour', 'Grains & Pulses'),
('Anchovies', 'Seafood'),
('Apple', 'Fruits & Vegetables'),
('Apricot', 'Fruits & Vegetables'),
('Arabica Coffee', 'Beverages'),
('Arborio Rice', 'Grains & Pulses'),
('Asparagus', 'Fruits & Vegetables'),
('Avocado Oil', 'Oils & Fats'),
('Banana', 'Fruits & Vegetables'),
('Basmati Rice', 'Grains & Pulses'),
('Bell Pepper', 'Fruits & Vegetables'),
('Black Coffee', 'Beverages'),
('Black Rice', 'Grains & Pulses'),
('Black Tea', 'Beverages'),
('Blueberries', 'Fruits & Vegetables'),
('Bread Flour', 'Grains & Pulses'),
('Broccoli', 'Fruits & Vegetables'),
('Brown Rice', 'Grains & Pulses'),
('Butter', 'Dairy'),
('Butter Biscuit', 'Bakery'),
('Buttermilk', 'Dairy'),
('Cabbage', 'Fruits & Vegetables'),
('Canola Oil', 'Oils & Fats'),
('Carrot', 'Fruits & Vegetables'),
('Cauliflower', 'Grains & Pulses'),
('Cheddar Cheese', 'Dairy'),
('Cheese', 'Dairy'),
('Cherry', 'Fruits & Vegetables'),
('Chocolate Biscuit', 'Bakery'),
('Coconut', 'Fruits & Vegetables'),
('Coconut Oil', 'Oils & Fats'),
('Coconut Sugar', 'Grains & Pulses'),
('Cod', 'Seafood'),
('Corn Oil', 'Oils & Fats'),
('Cottage Cheese', 'Dairy'),
('Cream', 'Dairy'),
('Cucumber', 'Fruits & Vegetables'),
('Digestive Biscuit', 'Bakery'),
('Egg (Chicken)', 'Dairy'),
('Egg (Duck)', 'Dairy'),
('Egg (Goose)', 'Dairy'),
('Egg (Quail)', 'Dairy'),
('Egg (Turkey)', 'Dairy'),
('Eggplant', 'Fruits & Vegetables'),
('Evaporated Milk', 'Dairy'),
('Feta Cheese', 'Dairy'),
('Garlic', 'Fruits & Vegetables'),
('Gouda Cheese', 'Dairy'),
('Grapes', 'Fruits & Vegetables'),
('Greek Yogurt', 'Dairy'),
('Green Beans', 'Fruits & Vegetables'),
('Green Coffee', 'Beverages'),
('Green Tea', 'Beverages'),
('Haddock', 'Seafood'),
('Halibut', 'Seafood'),
('Heavy Cream', 'Dairy'),
('Herbal Tea', 'Beverages'),
('Jasmine Rice', 'Grains & Pulses'),
('Kale', 'Fruits & Vegetables'),
('Kiwi', 'Fruits & Vegetables'),
('Lemon', 'Fruits & Vegetables'),
('Lettuce', 'Fruits & Vegetables'),
('Lime', 'Fruits & Vegetables'),
('Long Grain Rice', 'Grains & Pulses'),
('Mackerel', 'Seafood'),
('Mango', 'Fruits & Vegetables'),
('Milk', 'Dairy'),
('Mozzarella Cheese', 'Dairy'),
('Multigrain Bread', 'Bakery'),
('Mushrooms', 'Fruits & Vegetables'),
('Oatmeal Biscuit', 'Bakery'),
('Olive Oil', 'Oils & Fats'),
('Onion', 'Fruits & Vegetables'),
('Orange', 'Fruits & Vegetables'),
('Palm Oil', 'Oils & Fats'),
('Papaya', 'Fruits & Vegetables'),
('Parmesan Cheese', 'Dairy'),
('Peach', 'Fruits & Vegetables'),
('Peanut Oil', 'Oils & Fats'),
('Pear', 'Fruits & Vegetables'),
('Peas', 'Fruits & Vegetables'),
('Pineapple', 'Fruits & Vegetables'),
('Plum', 'Fruits & Vegetables'),
('Pomegranate', 'Fruits & Vegetables'),
('Potato', 'Fruits & Vegetables'),
('Powdered Sugar', 'Grains & Pulses'),
('Raw Sugar', 'Grains & Pulses'),
('Rice Flour', 'Grains & Pulses'),
('Ricotta Cheese', 'Dairy'),
('Robusta Coffee', 'Beverages'),
('Rye Bread', 'Bakery'),
('Salmon', 'Seafood'),
('Sardines', 'Seafood'),
('Sesame Oil', 'Oils & Fats'),
('Short Grain Rice', 'Grains & Pulses'),
('Sour Cream', 'Dairy'),
('Sourdough Bread', 'Bakery'),
('Spinach', 'Fruits & Vegetables'),
('Strawberries', 'Fruits & Vegetables'),
('Sunflower Oil', 'Oils & Fats'),
('Sushi Rice', 'Grains & Pulses'),
('Sweet Potato', 'Fruits & Vegetables'),
('Swiss Cheese', 'Dairy'),
('Tilapia', 'Seafood'),
('Tomato', 'Fruits & Vegetables'),
('Trout', 'Seafood'),
('Tuna', 'Seafood'),
('Vanilla Biscuit', 'Bakery'),
('Vegetable Oil', 'Oils & Fats'),
('Watermelon', 'Fruits & Vegetables'),
('Whipped Cream', 'Dairy'),
('White Bread', 'Bakery'),
('White Rice', 'Grains & Pulses'),
('White Sugar', 'Grains & Pulses'),
('White Tea', 'Beverages'),
('Whole Wheat Bread', 'Bakery'),
('Whole Wheat Flour', 'Grains & Pulses'),
('Wild Rice', 'Grains & Pulses'),
('Yogurt', 'Dairy'),
('Zucchini', 'Fruits & Vegetables');

-- --------------------------------------------------------

--
-- Table structure for table `OrderItem`
--

CREATE TABLE `OrderItem` (
  `CustomerEmail` varchar(255) NOT NULL,
  `OrderID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL
) ;

--
-- Dumping data for table `OrderItem`
--

INSERT INTO `OrderItem` (`CustomerEmail`, `OrderID`, `ItemID`, `Quantity`) VALUES
('afreanq@de.vu', 4, 4, 1),
('bmcgeneayx@tiny.cc', 11, 130, 1),
('ccaudwellr@ebay.co.uk', 5, 22, 1),
('edeclerkt@foxnews.com', 7, 68, 2),
('gbatalleo@moonfruit.com', 2, 56, 3),
('gduprez@hibu.com', 13, 166, 1),
('hortzenp@cbsnews.com', 3, 2, 2),
('mmcgoldricky@chicagotribune.com', 12, 148, 2),
('pchilderss@mashable.com', 6, 40, 2),
('pmaccaffreyw@ted.com', 10, 112, 9),
('qtreffreyn@nasa.gov', 1, 38, 1),
('tapfelu@va.gov', 8, 76, 4),
('tsouthallv@shop-pro.jp', 9, 94, 2);

-- --------------------------------------------------------

--
-- Table structure for table `PaymentInfo`
--

CREATE TABLE `PaymentInfo` (
  `ID` int(11) NOT NULL,
  `CustomerEmail` varchar(255) NOT NULL,
  `Type` varchar(50) NOT NULL,
  `Provider` varchar(50) NOT NULL,
  `First_Name` varchar(100) NOT NULL,
  `Last_Name` varchar(100) NOT NULL,
  `Number` varchar(25) NOT NULL,
  `Exp_Date` date NOT NULL,
  `CVC` varchar(10) NOT NULL,
  `Zip` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `PaymentInfo`
--

INSERT INTO `PaymentInfo` (`ID`, `CustomerEmail`, `Type`, `Provider`, `First_Name`, `Last_Name`, `Number`, `Exp_Date`, `CVC`, `Zip`) VALUES
(84, 'abrave2b@sciencedaily.com', 'debit', 'jcb', 'Alvan', 'Brave', '4911480000000000000', '2025-07-24', '396', '59775'),
(56, 'acaesar1j@wix.com', 'credit', 'jcb', 'Amelia', 'Caesar', '4508110000000000', '2026-03-12', '895', '10213'),
(10, 'acinavas9@discuz.net', 'credit', 'jcb', 'Adrien', 'Cinavas', '4175010000000000', '2025-08-30', '430', '72225'),
(27, 'afreanq@de.vu', 'credit', 'jcb', 'Antoine', 'Frean', '3587180000000000', '2026-01-20', '838', '42500'),
(19, 'afryetti@statcounter.com', 'credit', 'americanexpress', 'Alicia', 'Fryett', '3550290000000000', '2025-11-24', '638', '66189'),
(94, 'afryman2l@freewebs.com', 'debit', 'jcb', 'Allister', 'Fryman', '3584990000000000', '2025-10-18', '597', '54329'),
(15, 'ahastone@hud.gov', 'credit', 'diners-club-carte-blanche', 'Annecorinne', 'Haston', '604872000000000000', '2025-04-25', '165', '10205'),
(13, 'aholmec@istockphoto.com', 'credit', 'jcb', 'Ardis', 'Holme', '4844040000000000', '2025-05-21', '315', '50154'),
(76, 'amawdsley23@gravatar.com', 'credit', 'laser', 'Alvira', 'Mawdsley', '6387080000000000', '2025-11-21', '588', '53869'),
(97, 'aranklin2o@mashable.com', 'debit', 'jcb', 'Archer', 'Ranklin', '5002350000000000', '2025-07-02', '326', '62182'),
(102, 'bbuckenham2t@merriam-webster.com', 'debit', 'diners-club-enroute', 'Branden', 'Buckenham', '4936260000000000', '2025-08-14', '865', '47475'),
(9, 'bdacosta8@wisc.edu', 'credit', 'jcb', 'Benoit', 'Da Costa', '67062000000000000', '2025-05-25', '134', '11882'),
(68, 'beakin1v@indiegogo.com', 'credit', 'jcb', 'Brade', 'Eakin', '3570860000000000', '2025-09-06', '970', '43967'),
(101, 'bfullbrook2s@etsy.com', 'debit', 'visa-electron', 'Berna', 'Fullbrook', '337942000000000', '2025-08-08', '454', '29343'),
(71, 'bhartly1y@drupal.org', 'credit', 'jcb', 'Bartlet', 'Hartly', '3568550000000000', '2026-01-02', '860', '11617'),
(80, 'blambrook27@blogspot.com', 'debit', 'jcb', 'Becky', 'Lambrook', '3573160000000000', '2026-03-10', '856', '64302'),
(34, 'bmcgeneayx@tiny.cc', 'credit', 'bankcard', 'Beniamino', 'McGeneay', '345168000000000', '2025-09-30', '985', '57763'),
(44, 'bsoldi17@java.com', 'credit', 'maestro', 'Betsey', 'Soldi', '490512000000000000', '2025-05-06', '685', '81267'),
(48, 'bstonuary1b@domainmarket.com', 'credit', 'jcb', 'Berni', 'Stonuary', '3589400000000000', '2025-08-07', '979', '14562'),
(77, 'cbaxter24@gov.uk', 'debit', 'jcb', 'Cherlyn', 'Baxter', '3563070000000000', '2025-09-04', '570', '50249'),
(79, 'cbiggadike26@cargocollective.com', 'debit', 'mastercard', 'Christan', 'Biggadike', '5020290000000000000', '2025-07-22', '979', '24653'),
(28, 'ccaudwellr@ebay.co.uk', 'credit', 'maestro', 'Clary', 'Caudwell', '3589320000000000', '2026-01-09', '712', '16433'),
(81, 'cmountcastle28@shinystat.com', 'debit', 'americanexpress', 'Cherice', 'Mountcastle', '201762000000000', '2025-04-09', '173', '91704'),
(96, 'ctillerton2n@theglobeandmail.com', 'debit', 'jcb', 'Case', 'Tillerton', '6709450000000000', '2025-06-27', '981', '18909'),
(72, 'cwoodeson1z@vinaora.com', 'credit', 'jcb', 'Cordy', 'Woodeson', '67099500000000000', '2025-03-26', '542', '22147'),
(62, 'dfihelly1p@usnews.com', 'credit', 'jcb', 'Debera', 'Fihelly', '5108750000000000', '2025-12-25', '889', '42002'),
(20, 'dgarrowj@chron.com', 'credit', 'jcb', 'Dione', 'Garrow', '201575000000000', '2026-03-03', '638', '15731'),
(66, 'dkenford1t@soundcloud.com', 'credit', 'switch', 'Dode', 'Kenford', '5100140000000000', '2025-12-13', '426', '55904'),
(52, 'drugiero1f@amazon.co.jp', 'credit', 'jcb', 'Dorine', 'Rugiero', '3536560000000000', '2025-10-15', '257', '69150'),
(7, 'dvedenisov6@acquirethisname.com', 'credit', 'bankcard', 'Dynah', 'Vedenisov', '3560460000000000', '2026-02-27', '991', '92221'),
(30, 'edeclerkt@foxnews.com', 'credit', 'solo', 'Erny', 'de Clerk', '5602240000000000000', '2025-04-09', '495', '99978'),
(4, 'efinicj3@imgur.com', 'credit', 'jcb', 'Else', 'Finicj', '4119980000000', '2025-05-04', '334', '42551'),
(16, 'eritchingsf@paypal.com', 'credit', 'jcb', 'Enid', 'Ritchings', '3565650000000000', '2025-11-19', '271', '82834'),
(99, 'euff2q@slate.com', 'debit', 'solo', 'Erl', 'Uff', '5610930000000000', '2025-10-21', '218', '61872'),
(65, 'fbatchley1s@washington.edu', 'credit', 'jcb', 'Faustine', 'Batchley', '3545460000000000', '2025-08-08', '653', '38758'),
(63, 'flear1q@wordpress.com', 'credit', 'mastercard', 'Francoise', 'Lear', '604088000000000', '2025-10-02', '385', '38042'),
(75, 'fscupham22@tinypic.com', 'credit', 'china-unionpay', 'Finley', 'Scupham', '4026500000000000', '2025-05-04', '417', '67192'),
(41, 'fvasyutin14@noaa.gov', 'credit', 'jcb', 'Fidelia', 'Vasyutin', '30518300000000', '2026-02-07', '864', '74065'),
(25, 'gbatalleo@moonfruit.com', 'credit', 'jcb', 'Gwendolin', 'Batalle', '3573580000000000', '2025-11-17', '881', '74356'),
(36, 'gduprez@hibu.com', 'credit', 'jcb', 'Guilbert', 'Du Pre', '5893170000000000000', '2025-04-07', '788', '24368'),
(38, 'gfairfull11@independent.co.uk', 'credit', 'jcb', 'Gregoor', 'Fairfull', '675922000000000000', '2025-08-16', '238', '83687'),
(93, 'glenahan2k@weibo.com', 'debit', 'jcb', 'Geoff', 'Lenahan', '6333950000000000000', '2025-08-31', '624', '41593'),
(82, 'hdonan29@yellowbook.com', 'debit', 'jcb', 'Harwell', 'Donan', '5100180000000000', '2025-06-25', '817', '32840'),
(70, 'hdurnell1x@thetimes.co.uk', 'credit', 'jcb', 'Hedwig', 'Durnell', '3534710000000000', '2025-12-15', '497', '51428'),
(23, 'hjodlowskim@businessinsider.com', 'credit', 'jcb', 'Harv', 'Jodlowski', '372301000000000', '2025-08-13', '961', '61153'),
(26, 'hortzenp@cbsnews.com', 'credit', 'visa-electron', 'Humfrey', 'Ortzen', '5020790000000000000', '2025-08-05', '820', '90356'),
(95, 'icawsby2m@issuu.com', 'debit', 'switch', 'Iseabal', 'Cawsby', '3580720000000000', '2025-05-23', '949', '79803'),
(88, 'igimblett2f@boston.com', 'debit', 'instapayment', 'Ileana', 'Gimblett', '3574580000000000', '2025-11-12', '925', '24636'),
(58, 'ihendrix1l@blogspot.com', 'credit', 'mastercard', 'Ira', 'Hendrix', '5100180000000000', '2025-11-02', '199', '42414'),
(8, 'iwonter7@jimdo.com', 'credit', 'jcb', 'Idell', 'Wonter', '676790000000000000', '2026-01-21', '833', '29043'),
(83, 'jbowstead2a@weebly.com', 'debit', 'maestro', 'Jens', 'Bowstead', '5602220000000000', '2026-02-21', '671', '89354'),
(74, 'jjimson21@php.net', 'credit', 'visa', 'Jobyna', 'Jimson', '3579570000000000', '2025-08-13', '414', '75903'),
(87, 'jkingescot2e@yolasite.com', 'debit', 'jcb', 'Jeffrey', 'Kingescot', '3534670000000000', '2025-12-27', '287', '75503'),
(57, 'jrodway1k@godaddy.com', 'credit', 'jcb', 'Jo-ann', 'Rodway', '4041600000000', '2025-08-14', '829', '97699'),
(21, 'jstirlingk@live.com', 'credit', 'diners-club-international', 'Janenna', 'Stirling', '3545030000000000', '2025-09-09', '969', '62753'),
(3, 'kandretti2@ted.com', 'credit', 'mastercard', 'Kimberlyn', 'Andretti', '5602220000000000', '2025-08-10', '925', '27691'),
(37, 'kgribbell10@usa.gov', 'credit', 'jcb', 'Karen', 'Gribbell', '36320700000000', '2025-04-17', '486', '61617'),
(6, 'ktettley5@myspace.com', 'credit', 'diners-club-enroute', 'Kipp', 'Tettley', '30348100000000', '2025-11-18', '542', '41651'),
(64, 'lbonass1r@hubpages.com', 'credit', 'jcb', 'Lanni', 'Bonass', '3573840000000000', '2026-03-10', '223', '38642'),
(59, 'ldecarteret1m@europa.eu', 'credit', 'bankcard', 'Linc', 'De Carteret', '3589210000000000', '2025-10-25', '872', '46606'),
(17, 'lhitzmanng@github.io', 'credit', 'solo', 'Lief', 'Hitzmann', '5602230000000000', '2025-09-15', '382', '72923'),
(55, 'lkrimmer1i@home.pl', 'credit', 'visa', 'Laverne', 'Krimmer', '3571910000000000', '2026-03-03', '100', '57527'),
(40, 'llemm13@techcrunch.com', 'credit', 'instapayment', 'Lyndell', 'Lemm', '3535990000000000', '2025-09-05', '154', '57802'),
(54, 'mduquesnay1h@time.com', 'credit', 'diners-club-enroute', 'Mariquilla', 'Duquesnay', '3570950000000000', '2025-05-26', '390', '46172'),
(2, 'mhurcombe1@freewebs.com', 'credit', 'jcb', 'Michelle', 'Hurcombe', '3586220000000000', '2025-06-04', '835', '86728'),
(91, 'mkindall2i@un.org', 'debit', 'bankcard', 'Mart', 'Kindall', '3577200000000000', '2025-08-05', '435', '27017'),
(39, 'mlongmire12@github.com', 'credit', 'jcb', 'Mozelle', 'Longmire', '3572330000000000', '2025-09-10', '329', '70454'),
(35, 'mmcgoldricky@chicagotribune.com', 'credit', 'jcb', 'Manya', 'McGoldrick', '30164700000000', '2026-01-06', '764', '60826'),
(45, 'msivess18@dagondesign.com', 'credit', 'jcb', 'Magdalena', 'Sivess', '3536600000000000', '2025-06-05', '568', '46031'),
(100, 'msyce2r@imgur.com', 'debit', 'visa', 'Maegan', 'Syce', '201978000000000', '2025-12-14', '465', '48598'),
(11, 'nlacea@weebly.com', 'credit', 'switch', 'Nollie', 'Lace', '3584380000000000', '2025-09-30', '939', '36099'),
(86, 'nmarklin2d@amazon.co.jp', 'debit', 'solo', 'Nelson', 'Marklin', '5226880000000000', '2025-11-11', '826', '56116'),
(42, 'npobjoy15@columbia.edu', 'credit', 'maestro', 'Nedi', 'Pobjoy', '5010120000000000', '2025-08-23', '376', '38580'),
(51, 'oringer1e@bandcamp.com', 'credit', 'americanexpress', 'Oliviero', 'Ringer', '5128440000000000', '2026-03-12', '848', '87811'),
(29, 'pchilderss@mashable.com', 'credit', 'americanexpress', 'Philippa', 'Childers', '3577150000000000', '2025-10-16', '296', '70110'),
(46, 'pkunzel19@prlog.org', 'credit', 'jcb', 'Perkin', 'Kunzel', '6760000000000000', '2026-01-10', '428', '47913'),
(12, 'plyptradeb@wikia.com', 'credit', 'jcb', 'Patrizia', 'Lyptrade', '3550440000000000', '2026-03-12', '917', '77506'),
(33, 'pmaccaffreyw@ted.com', 'credit', 'americanexpress', 'Priscilla', 'MacCaffrey', '4936950000000000000', '2026-03-02', '268', '89104'),
(5, 'pmaccrackan4@slideshare.net', 'credit', 'jcb', 'Perle', 'MacCrackan', '3583660000000000', '2025-05-31', '244', '50813'),
(14, 'ptregidgad@theglobeandmail.com', 'credit', 'visa-electron', 'Porty', 'Tregidga', '3586090000000000', '2025-05-25', '943', '49045'),
(24, 'qtreffreyn@nasa.gov', 'credit', 'maestro', 'Quinton', 'Treffrey', '3535780000000000', '2026-02-11', '208', '30474'),
(98, 'rballston2p@umn.edu', 'debit', 'laser', 'Romola', 'Ballston', '4903240000000000000', '2025-07-09', '206', '74636'),
(43, 'rdurbin16@163.com', 'credit', 'maestro', 'Roselle', 'Durbin', '490301000000000000', '2025-03-18', '543', '77833'),
(92, 'rhaisell2j@istockphoto.com', 'debit', 'visa', 'Rahal', 'Haisell', '3562360000000000', '2025-08-31', '143', '90242'),
(49, 'rmacgown1c@sitemeter.com', 'credit', 'diners-club-carte-blanche', 'Randy', 'MacGown', '3549160000000000', '2025-08-29', '954', '47003'),
(18, 'rpaleyh@dagondesign.com', 'credit', 'mastercard', 'Robena', 'Paley', '50384200000000000', '2025-05-01', '361', '79659'),
(50, 'rriccard1d@storify.com', 'credit', 'diners-club-us-ca', 'Reynold', 'Riccard', '5007660000000000', '2026-02-27', '624', '33152'),
(73, 'scadman20@canalblog.com', 'credit', 'mastercard', 'Sallyanne', 'Cadman', '3555800000000000', '2025-12-22', '509', '22167'),
(53, 'sderill1g@vistaprint.com', 'credit', 'jcb', 'Sallyanne', 'Derill', '30531100000000', '2025-11-08', '881', '55282'),
(1, 'seagling0@hexun.com', 'credit', 'jcb', 'Shermy', 'Eagling', '6304470000000000', '2025-07-06', '770', '25083'),
(47, 'smarzele1a@sciencedaily.com', 'credit', 'jcb', 'Sallie', 'Marzele', '337941000000000', '2025-10-14', '816', '61392'),
(61, 'soury1o@desdev.cn', 'credit', 'jcb', 'Sly', 'Oury', '201431000000000', '2025-08-22', '706', '56096'),
(89, 'spetrowsky2g@simplemachines.org', 'debit', 'bankcard', 'Sherm', 'Petrowsky', '6389400000000000', '2025-07-04', '928', '96072'),
(31, 'tapfelu@va.gov', 'credit', 'visa-electron', 'Truda', 'Apfel', '3560720000000000', '2025-09-13', '181', '17424'),
(67, 'theed1u@purevolume.com', 'credit', 'jcb', 'Tarrance', 'Heed', '3586400000000000', '2026-03-04', '569', '46966'),
(85, 'tmelato2c@gnu.org', 'debit', 'china-unionpay', 'Tonnie', 'Melato', '3571840000000000', '2025-11-05', '630', '82664'),
(32, 'tsouthallv@shop-pro.jp', 'credit', 'maestro', 'Ted', 'Southall', '3569480000000000', '2025-05-24', '114', '45747'),
(22, 'vcarriagel@usgs.gov', 'credit', 'diners-club-enroute', 'Vivian', 'Carriage', '502093000000000000', '2025-04-23', '842', '41654'),
(78, 'vgeldeard25@springer.com', 'debit', 'jcb', 'Valentine', 'Geldeard', '4905380000000000', '2025-12-20', '898', '45400'),
(69, 'wbedow1w@ow.ly', 'credit', 'bankcard', 'Wiatt', 'Bedow', '604281000000000000', '2025-12-25', '795', '89698'),
(90, 'wslimmon2h@rediff.com', 'debit', 'jcb', 'Warde', 'Slimmon', '4026710000000000', '2025-11-29', '535', '76624'),
(60, 'zzohrer1n@ihg.com', 'credit', 'diners-club-enroute', 'Zena', 'Zohrer', '4405940000000000', '2025-05-16', '305', '70095');

-- --------------------------------------------------------

--
-- Table structure for table `Storekeeper_R1`
--

CREATE TABLE `Storekeeper_R1` (
  `Email` varchar(255) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Storekeeper_R1`
--

INSERT INTO `Storekeeper_R1` (`Email`, `PhoneNumber`) VALUES
('edymoke2@hatena.ne.jp', '551-951-4217'),
('smccrystal0@google.nl', '669-434-8694'),
('mjaze1@unicef.org', '881-269-2676');

-- --------------------------------------------------------

--
-- Table structure for table `Storekeeper_R2`
--

CREATE TABLE `Storekeeper_R2` (
  `PhoneNumber` varchar(20) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Username` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Storekeeper_R2`
--

INSERT INTO `Storekeeper_R2` (`PhoneNumber`, `Email`, `Username`) VALUES
('551-951-4217', 'edymoke2@hatena.ne.jp', 'etewnion2'),
('669-434-8694', 'smccrystal0@google.nl', 'tcurryer0'),
('881-269-2676', 'mjaze1@unicef.org', 'eruss1');

-- --------------------------------------------------------

--
-- Table structure for table `UpdateCart`
--

CREATE TABLE `UpdateCart` (
  `ItemID` int(11) NOT NULL,
  `CustomerEmail` varchar(255) NOT NULL,
  `Action` varchar(50) NOT NULL,
  `Timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `UpdateCart`
--

INSERT INTO `UpdateCart` (`ItemID`, `CustomerEmail`, `Action`, `Timestamp`) VALUES
(22, 'afryetti@statcounter.com', 'SetQuantity', '2026-03-14 15:58:00'),
(5, 'ahastone@hud.gov', 'Add', '2026-03-10 15:58:00'),
(305, 'eritchingsf@paypal.com', 'Add', '2026-03-11 14:58:00'),
(203, 'lhitzmanng@github.io', 'Remove', '2026-03-12 18:58:00'),
(508, 'rpaleyh@dagondesign.com', 'SetQuantity', '2026-03-13 20:58:00');

-- --------------------------------------------------------

--
-- Table structure for table `UpdateInventory`
--

CREATE TABLE `UpdateInventory` (
  `ItemID` int(11) NOT NULL,
  `StorekeeperEmail` varchar(255) NOT NULL,
  `Action` varchar(50) NOT NULL,
  `Timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `UpdateInventory`
--

INSERT INTO `UpdateInventory` (`ItemID`, `StorekeeperEmail`, `Action`, `Timestamp`) VALUES
(264, 'edymoke2@hatena.ne.jp', 'Stop', '2025-06-22 00:00:00'),
(265, 'edymoke2@hatena.ne.jp', 'Stop', '2025-04-24 00:00:00'),
(266, 'edymoke2@hatena.ne.jp', 'Stop', '2026-01-19 00:00:00'),
(267, 'edymoke2@hatena.ne.jp', 'Stop', '2025-08-20 00:00:00'),
(268, 'edymoke2@hatena.ne.jp', 'Stop', '2025-09-07 00:00:00'),
(269, 'edymoke2@hatena.ne.jp', 'Stop', '2025-05-25 00:00:00'),
(246, 'mjaze1@unicef.org', 'Restock', '2026-01-09 00:00:00'),
(247, 'mjaze1@unicef.org', 'Restock', '2026-01-17 00:00:00'),
(248, 'mjaze1@unicef.org', 'Restock', '2025-12-05 00:00:00'),
(249, 'mjaze1@unicef.org', 'Restock', '2025-05-05 00:00:00'),
(250, 'mjaze1@unicef.org', 'Restock', '2025-08-04 00:00:00'),
(251, 'mjaze1@unicef.org', 'Adjust', '2025-09-19 00:00:00'),
(252, 'mjaze1@unicef.org', 'Adjust', '2025-09-25 00:00:00'),
(253, 'mjaze1@unicef.org', 'Adjust', '2025-04-05 00:00:00'),
(254, 'mjaze1@unicef.org', 'Adjust', '2025-04-30 00:00:00'),
(255, 'mjaze1@unicef.org', 'Adjust', '2025-12-24 00:00:00'),
(256, 'mjaze1@unicef.org', 'Adjust', '2025-03-26 00:00:00'),
(257, 'mjaze1@unicef.org', 'Adjust', '2025-11-26 00:00:00'),
(258, 'mjaze1@unicef.org', 'Adjust', '2025-07-23 00:00:00'),
(259, 'mjaze1@unicef.org', 'Adjust', '2026-02-13 00:00:00'),
(260, 'mjaze1@unicef.org', 'Adjust', '2025-08-21 00:00:00'),
(261, 'mjaze1@unicef.org', 'Stop', '2025-09-29 00:00:00'),
(262, 'mjaze1@unicef.org', 'Stop', '2025-05-05 00:00:00'),
(263, 'mjaze1@unicef.org', 'Stop', '2025-08-28 00:00:00'),
(233, 'smccrystal0@google.nl', 'Restock', '2026-02-18 00:00:00'),
(234, 'smccrystal0@google.nl', 'Restock', '2025-03-18 00:00:00'),
(235, 'smccrystal0@google.nl', 'Restock', '2025-08-13 00:00:00'),
(236, 'smccrystal0@google.nl', 'Restock', '2025-11-27 00:00:00'),
(237, 'smccrystal0@google.nl', 'Restock', '2025-11-24 00:00:00'),
(238, 'smccrystal0@google.nl', 'Restock', '2025-12-23 00:00:00'),
(239, 'smccrystal0@google.nl', 'Restock', '2025-10-25 00:00:00'),
(240, 'smccrystal0@google.nl', 'Restock', '2025-08-18 00:00:00'),
(241, 'smccrystal0@google.nl', 'Restock', '2026-02-02 00:00:00'),
(242, 'smccrystal0@google.nl', 'Restock', '2025-12-02 00:00:00'),
(243, 'smccrystal0@google.nl', 'Restock', '2025-12-19 00:00:00'),
(244, 'smccrystal0@google.nl', 'Restock', '2025-12-31 00:00:00'),
(245, 'smccrystal0@google.nl', 'Restock', '2025-12-16 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `AdminDataOperation`
--

CREATE TABLE `AdminDataOperation` (
  `OperationID` bigint NOT NULL AUTO_INCREMENT,
  `StorekeeperEmail` varchar(255) NOT NULL,
  `OperationType` enum('import','export') NOT NULL,
  `EntityType` enum('inventory','transactions') NOT NULL,
  `DataFormat` enum('csv','json','xml','html') NOT NULL,
  `Status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
  `SourceFilename` varchar(255) DEFAULT NULL,
  `RequestedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `CompletedAt` datetime DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`OperationID`),
  KEY `idx_adminop_storekeeper_requested` (`StorekeeperEmail`, `RequestedAt`),
  KEY `idx_adminop_status` (`Status`),
  KEY `idx_adminop_type_entity` (`OperationType`, `EntityType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `AdminDataOperation`
--

INSERT INTO `AdminDataOperation` (`OperationID`, `StorekeeperEmail`, `OperationType`, `EntityType`, `DataFormat`, `Status`, `SourceFilename`, `RequestedAt`, `CompletedAt`, `Notes`) VALUES
(1, 'edymoke2@hatena.ne.jp', 'import', 'inventory', 'csv', 'success', 'inventory_import_batch1.csv', '2026-03-15 10:05:00', '2026-03-15 10:06:00', 'Initial inventory import'),
(2, 'smccrystal0@google.nl', 'export', 'transactions', 'json', 'success', 'transactions_export_mar16.json', '2026-03-16 14:20:00', '2026-03-16 14:20:30', 'Prepared report for review'),
(3, 'mjaze1@unicef.org', 'import', 'inventory', 'csv', 'failed', 'inventory_import_batch2.csv', '2026-03-17 09:10:00', '2026-03-17 09:11:00', 'One or more rows failed validation');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `CustomerOrder`
--
ALTER TABLE `CustomerOrder`
  ADD KEY `fk_customerorder_customer` (`CustomerEmail`);

--
-- Indexes for table `Customer_R1`
--
ALTER TABLE `Customer_R1`
  ADD PRIMARY KEY (`Email`),
  ADD UNIQUE KEY `PhoneNumber` (`PhoneNumber`);

--
-- Indexes for table `Customer_R2`
--
ALTER TABLE `Customer_R2`
  ADD PRIMARY KEY (`PhoneNumber`),
  ADD KEY `fk_customer_r2_r1` (`Email`);

--
-- Indexes for table `ItemRequest`
--
ALTER TABLE `ItemRequest`
  ADD PRIMARY KEY (`ID`,`CustomerEmail`),
  ADD KEY `fk_itemrequest_customer` (`CustomerEmail`);

--
-- Indexes for table `Item_R1`
--
ALTER TABLE `Item_R1`
  ADD PRIMARY KEY (`ItemID`),
  ADD COLUMN `SKU` varchar(64) NULL AFTER `ItemID`;

UPDATE `Item_R1`
SET `SKU` = CONCAT('KM-', LPAD(`ItemID`, 6, '0'))
WHERE `SKU` IS NULL;

ALTER TABLE `Item_R1`
  MODIFY `SKU` varchar(64) NOT NULL,
  ADD UNIQUE KEY `uq_item_r1_sku` (`SKU`),
  ADD CONSTRAINT `chk_item_r1_quantity_nonnegative` CHECK (`Quantity` >= 0),
  ADD CONSTRAINT `chk_item_r1_price_nonnegative` CHECK (`Price` >= 0);

--
-- Indexes for table `Item_R2`
--
ALTER TABLE `Item_R2`
  ADD PRIMARY KEY (`Name`);

--
-- Indexes for table `OrderItem`
--
ALTER TABLE `OrderItem`
  ADD PRIMARY KEY (`CustomerEmail`,`OrderID`,`ItemID`),
  ADD KEY `fk_orderitem_order` (`OrderID`,`CustomerEmail`),
  ADD KEY `fk_orderitem_item` (`ItemID`);

--
-- Indexes for table `PaymentInfo`
--
ALTER TABLE `PaymentInfo`
  ADD PRIMARY KEY (`CustomerEmail`,`ID`),
  ADD UNIQUE KEY `ID` (`ID`);

--
-- Indexes for table `Storekeeper_R1`
--
ALTER TABLE `Storekeeper_R1`
  ADD PRIMARY KEY (`Email`),
  ADD UNIQUE KEY `PhoneNumber` (`PhoneNumber`);

--
-- Indexes for table `Storekeeper_R2`
--
ALTER TABLE `Storekeeper_R2`
  ADD PRIMARY KEY (`PhoneNumber`),
  ADD KEY `fk_storekeeper_r2_r1` (`Email`);

--
-- Indexes for table `UpdateCart`
--
ALTER TABLE `UpdateCart`
  ADD PRIMARY KEY (`CustomerEmail`,`ItemID`,`Timestamp`),
  ADD KEY `fk_updatecart_item` (`ItemID`);

--
-- Indexes for table `UpdateInventory`
--
ALTER TABLE `UpdateInventory`
  ADD PRIMARY KEY (`StorekeeperEmail`,`ItemID`,`Timestamp`),
  ADD KEY `fk_updateinventory_item` (`ItemID`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `CustomerOrder`
--
ALTER TABLE `CustomerOrder`
  ADD CONSTRAINT `fk_customerorder_customer` FOREIGN KEY (`CustomerEmail`) REFERENCES `Customer_R1` (`Email`) ON DELETE CASCADE;

--
-- Constraints for table `Customer_R2`
--
ALTER TABLE `Customer_R2`
  ADD CONSTRAINT `fk_customer_r2_r1` FOREIGN KEY (`Email`) REFERENCES `Customer_R1` (`Email`) ON DELETE CASCADE;

--
-- Constraints for table `ItemRequest`
--
ALTER TABLE `ItemRequest`
  ADD CONSTRAINT `fk_itemrequest_customer` FOREIGN KEY (`CustomerEmail`) REFERENCES `Customer_R1` (`Email`) ON DELETE CASCADE;

--
-- Constraints for table `OrderItem`
--
ALTER TABLE `OrderItem`
  ADD CONSTRAINT `fk_orderitem_item` FOREIGN KEY (`ItemID`) REFERENCES `Item_R1` (`ItemID`),
  ADD CONSTRAINT `fk_orderitem_order` FOREIGN KEY (`OrderID`, `CustomerEmail`) REFERENCES `CustomerOrder` (`OrderID`, `CustomerEmail`) ON DELETE CASCADE;
--
-- Constraints for table `PaymentInfo`
--
ALTER TABLE `PaymentInfo`
  ADD CONSTRAINT `fk_paymentinfo_customer` FOREIGN KEY (`CustomerEmail`) REFERENCES `Customer_R1` (`Email`) ON DELETE CASCADE;

--
-- Constraints for table `Storekeeper_R2`
--
ALTER TABLE `Storekeeper_R2`
  ADD CONSTRAINT `fk_storekeeper_r2_r1` FOREIGN KEY (`Email`) REFERENCES `Storekeeper_R1` (`Email`) ON DELETE CASCADE;

--
-- Constraints for table `AdminDataOperation`
--
ALTER TABLE `AdminDataOperation`
  ADD CONSTRAINT `fk_adminop_storekeeper` FOREIGN KEY (`StorekeeperEmail`) REFERENCES `Storekeeper_R1` (`Email`) ON DELETE RESTRICT;

--
-- Constraints for table `UpdateCart`
--
ALTER TABLE `UpdateCart`
  ADD CONSTRAINT `fk_updatecart_customer` FOREIGN KEY (`CustomerEmail`) REFERENCES `Customer_R1` (`Email`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_updatecart_item` FOREIGN KEY (`ItemID`) REFERENCES `Item_R1` (`ItemID`);

--
-- Constraints for table `UpdateInventory`
--
ALTER TABLE `UpdateInventory`
  ADD CONSTRAINT `fk_updateinventory_item` FOREIGN KEY (`ItemID`) REFERENCES `Item_R1` (`ItemID`),
  ADD CONSTRAINT `fk_updateinventory_storekeeper` FOREIGN KEY (`StorekeeperEmail`) REFERENCES `Storekeeper_R1` (`Email`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
