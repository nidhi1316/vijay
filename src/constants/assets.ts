/**
 * Centralized Static Assets Reference
 */

export const IMAGES = {
  hero: {
    flag: require('../../assets/images/hero/soldiers_hero.jpg'),
  },
  demo: {
    soldierMale: require('../../assets/images/demo/soldier_male.jpg'),
    soldierFemale: require('../../assets/images/demo/soldier_female.jpg'),
    armyGroup: require('../../assets/images/demo/army_group.jpg'),
    background: require('../../assets/images/demo/background.png'),
  },
  icons: {
    logo: require('../../assets/images/icons/logo.png'),
    cloudUpload: require('../../assets/images/icons/logo.png'),
  },
  forces: {
    nsg: require('../../assets/images/forces/nsg.jpg'),
    blackCat: require('../../assets/images/forces/black_cat.jpg'),
    crpfCobra: require('../../assets/images/forces/crpf_cobra.jpg'),
    bsf: require('../../assets/images/forces/bsf.jpg'),
    paraSf: require('../../assets/images/forces/para_sf.jpg'),
    garud: require('../../assets/images/forces/garud.jpg'),
  },
};

export const SAMPLES = [
  {
    id: 'sample1',
    name: 'Indian Flag Raising Soldiers',
    source: require('../../assets/images/hero/soldiers_hero.jpg'),
  },
  {
    id: 'sample2',
    name: 'Para SF Commando',
    source: require('../../assets/images/demo/soldier_male.jpg'),
  },
  {
    id: 'sample3',
    name: 'Army Officers Team',
    source: require('../../assets/images/demo/army_group.jpg'),
  },
  {
    id: 'sample4',
    name: 'Female Officer Combat',
    source: require('../../assets/images/demo/soldier_female.jpg'),
  },
];

export const COMMANDO_POSITIONS = [
  'Chief of the Commandos',
  'Para SF - Special Operations Commander',
  'MARCOS - Tactical Assault Lead',
  'NSG (Black Cats) - Strike Commander',
  'Garud Commando Force - Combat Controller',
  'Para SF - Deep Recon Specialist',
  'Special Frontier Force - Tactical Scout',
];

export default IMAGES;
