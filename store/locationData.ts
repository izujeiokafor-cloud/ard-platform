
export interface City {
  name: string;
  lat: number;
  lng: number;
}

export interface State {
  name: string;
  cities: City[];
}

export const LOCATION_DATA: State[] = [
  {
    name: 'Lagos',
    cities: [
      { name: 'Ikeja', lat: 6.5967, lng: 3.3421 },
      { name: 'Lagos Island', lat: 6.4550, lng: 3.3942 },
      { name: 'Ikorodu', lat: 6.6194, lng: 3.5105 },
      { name: 'Lekki', lat: 6.4446, lng: 3.5173 },
      { name: 'Surulere', lat: 6.5059, lng: 3.3489 }
    ]
  },
  {
    name: 'Abuja (FCT)',
    cities: [
      { name: 'Garki', lat: 9.0343, lng: 7.4878 },
      { name: 'Wuse', lat: 9.0636, lng: 7.4727 },
      { name: 'Maitama', lat: 9.0882, lng: 7.4984 },
      { name: 'Asokoro', lat: 9.0436, lng: 7.5197 },
      { name: 'Gwarinpa', lat: 9.1084, lng: 7.4003 }
    ]
  },
  {
    name: 'Rivers',
    cities: [
      { name: 'Port Harcourt', lat: 4.8156, lng: 7.0498 },
      { name: 'Obio-Akpor', lat: 4.8482, lng: 6.9930 },
      { name: 'Bonny', lat: 4.4500, lng: 7.1667 }
    ]
  },
  {
    name: 'Oyo',
    cities: [
      { name: 'Ibadan', lat: 7.3775, lng: 3.9470 },
      { name: 'Ogbomosho', lat: 8.1333, lng: 4.2500 },
      { name: 'Oyo Town', lat: 7.8500, lng: 3.9333 }
    ]
  },
  {
    name: 'Kano',
    cities: [
      { name: 'Kano City', lat: 12.0022, lng: 8.5920 },
      { name: 'Wudil', lat: 11.8106, lng: 8.8471 }
    ]
  },
  {
    name: 'Enugu',
    cities: [
      { name: 'Enugu City', lat: 6.4584, lng: 7.5464 },
      { name: 'Nsukka', lat: 6.8561, lng: 7.3917 }
    ]
  },
  {
    name: 'Delta',
    cities: [
      { name: 'Asaba', lat: 6.1985, lng: 6.7297 },
      { name: 'Warri', lat: 5.5167, lng: 5.7500 },
      { name: 'Effurun', lat: 5.5534, lng: 5.7797 }
    ]
  },
  {
    name: 'Kaduna',
    cities: [
      { name: 'Kaduna City', lat: 10.5105, lng: 7.4165 },
      { name: 'Zaria', lat: 11.0667, lng: 7.7000 }
    ]
  },
  {
    name: 'Anambra',
    cities: [
      { name: 'Awka', lat: 6.2106, lng: 7.0731 },
      { name: 'Onitsha', lat: 6.1420, lng: 6.7881 },
      { name: 'Nnewi', lat: 6.0167, lng: 6.9167 }
    ]
  },
  {
    name: 'Edo',
    cities: [
      { name: 'Benin City', lat: 6.3350, lng: 5.6037 },
      { name: 'Auchi', lat: 7.0667, lng: 6.2667 }
    ]
  },
  {
    name: 'Ogun',
    cities: [
      { name: 'Abeokuta', lat: 7.1475, lng: 3.3619 },
      { name: 'Ota', lat: 6.6853, lng: 3.2307 },
      { name: 'Ijebu Ode', lat: 6.8194, lng: 3.9173 }
    ]
  },
  {
    name: 'Akwa Ibom',
    cities: [
      { name: 'Uyo', lat: 5.0333, lng: 7.9266 },
      { name: 'Eket', lat: 4.6433, lng: 7.9233 }
    ]
  },
  {
    name: 'Plateau',
    cities: [
      { name: 'Jos', lat: 9.8965, lng: 8.8583 }
    ]
  },
  {
    name: 'Kwara',
    cities: [
      { name: 'Ilorin', lat: 8.4799, lng: 4.5418 }
    ]
  },
  {
    name: 'Imo',
    cities: [
      { name: 'Owerri', lat: 5.4850, lng: 7.0350 }
    ]
  },
  {
    name: 'Abia',
    cities: [
      { name: 'Umuahia', lat: 5.5245, lng: 7.4939 },
      { name: 'Aba', lat: 5.1066, lng: 7.3667 }
    ]
  },
  {
    name: 'Adamawa',
    cities: [{ name: 'Yola', lat: 9.2035, lng: 12.4850 }]
  },
  {
    name: 'Bauchi',
    cities: [{ name: 'Bauchi City', lat: 10.3103, lng: 9.8439 }]
  },
  {
    name: 'Bayelsa',
    cities: [{ name: 'Yenagoa', lat: 4.9333, lng: 6.2667 }]
  },
  {
    name: 'Benue',
    cities: [{ name: 'Makurdi', lat: 7.7337, lng: 8.5214 }]
  },
  {
    name: 'Borno',
    cities: [{ name: 'Maiduguri', lat: 11.8311, lng: 13.1507 }]
  },
  {
    name: 'Cross River',
    cities: [{ name: 'Calabar', lat: 4.9757, lng: 8.3417 }]
  },
  {
    name: 'Ebonyi',
    cities: [{ name: 'Abakaliki', lat: 6.3236, lng: 8.1131 }]
  },
  {
    name: 'Ekiti',
    cities: [{ name: 'Ado Ekiti', lat: 7.6213, lng: 5.2214 }]
  },
  {
    name: 'Gombe',
    cities: [{ name: 'Gombe City', lat: 10.2897, lng: 11.1673 }]
  },
  {
    name: 'Jigawa',
    cities: [{ name: 'Dutse', lat: 11.7001, lng: 9.3333 }]
  },
  {
    name: 'Katsina',
    cities: [{ name: 'Katsina City', lat: 12.9894, lng: 7.6171 }]
  },
  {
    name: 'Kebbi',
    cities: [{ name: 'Birnin Kebbi', lat: 12.4539, lng: 4.1975 }]
  },
  {
    name: 'Kogi',
    cities: [{ name: 'Lokoja', lat: 7.7969, lng: 6.7405 }]
  },
  {
    name: 'Nasarawa',
    cities: [{ name: 'Lafia', lat: 8.4900, lng: 8.5200 }]
  },
  {
    name: 'Niger',
    cities: [{ name: 'Minna', lat: 9.6139, lng: 6.5569 }]
  },
  {
    name: 'Ondo',
    cities: [{ name: 'Akure', lat: 7.2507, lng: 5.2103 }]
  },
  {
    name: 'Osun',
    cities: [{ name: 'Osogbo', lat: 7.7667, lng: 4.5667 }]
  },
  {
    name: 'Sokoto',
    cities: [{ name: 'Sokoto City', lat: 13.0622, lng: 5.2339 }]
  },
  {
    name: 'Taraba',
    cities: [{ name: 'Jalingo', lat: 8.8917, lng: 11.3500 }]
  },
  {
    name: 'Yobe',
    cities: [{ name: 'Damaturu', lat: 11.7470, lng: 11.9611 }]
  },
  {
    name: 'Zamfara',
    cities: [{ name: 'Gusau', lat: 12.1622, lng: 6.6614 }]
  }
];
