export const UserRole = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
};

export const SeatStatus = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED_FEMALE: 'RESERVED_FEMALE',
  RESERVED_MALE: 'RESERVED_MALE',
};

export const SeatType = {
  TABLE_SEAT: 'TABLE_SEAT',
  CABIN: 'CABIN',
};

export const CheckInStatus = {
  PENDING: 'PENDING',
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
};

export const INITIAL_SEATS = [
  // Floor 1: "The Commons" - 12 Tables (T1-T12), 4 seats each
  // T1-T6: Reserved for Boys, T7-T12: Reserved for Girls
  ...Array.from({ length: 12 }).flatMap((_, clusterIdx) => 
    Array.from({ length: 4 }).map((_, seatIdx) => ({
      id: `f1-c${clusterIdx + 1}-s${seatIdx + 1}`,
      floor: 1,
      type: SeatType.TABLE_SEAT,
      clusterId: `T${clusterIdx + 1}`,
      label: `S${(clusterIdx * 4) + seatIdx + 1}`,
      status: clusterIdx < 6 ? SeatStatus.RESERVED_MALE : SeatStatus.RESERVED_FEMALE,
    }))
  ),
  // Floor 2: "Quiet Study Hall" - 12 Tables (T1-T12), 8 seats each (4/4)
  ...Array.from({ length: 12 }).flatMap((_, clusterIdx) => 
    Array.from({ length: 8 }).map((_, seatIdx) => ({
      id: `f2-c${clusterIdx + 1}-s${seatIdx + 1}`,
      floor: 2,
      type: SeatType.TABLE_SEAT,
      clusterId: `T${clusterIdx + 1}`,
      label: `S${(clusterIdx * 8) + seatIdx + 1}`,
      status: SeatStatus.AVAILABLE,
    }))
  ),
  // Floor 3: "Private Cabin Deck" - 10 Cabins
  ...Array.from({ length: 10 }).map((_, cabinIdx) => ({
    id: `f3-cab${cabinIdx + 1}`,
    floor: 3,
    type: SeatType.CABIN,
    label: `C${cabinIdx + 1}`,
    status: SeatStatus.AVAILABLE,
  })),
];

export const FLOOR_INFO = [
  { level: 1, name: "The Commons", subtitle: "Collaborative Pods" },
  { level: 2, name: "Quiet Study Hall", subtitle: "Deep Focus Stations" },
  { level: 3, name: "Private Cabin Deck", subtitle: "Silent Study Cabins" },
];
