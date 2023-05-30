import moment from 'moment';
import { z } from 'zod';

const AccessRequestUserSchema = z.object({
  firstName: z.string().nonempty('Required'),
  lastName: z.string().nonempty('Required'),
  position: z.string().max(100, 'Note must be less than 100 characters'),
});

export const AccessRequestSchema = z.object({
  agency: z.number().min(1, 'Invalid Agency').nonnegative('Required'),
  role: z.string().min(1, 'Invalid Role').nonempty('Required'),
  note: z.string().max(1000, 'Note must be less than 1000 characters'),
  user: AccessRequestUserSchema,
});

export const UserUpdateSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(100, 'Email must be less than 100 characters'),
  firstName: z.string().max(100, 'First Name must be less than 100 characters'),
  lastName: z.string().max(100, 'Last Name must be less than 100 characters'),
});

export const AgencyEditSchema = z
  .object({
    email: z
      .string()
      .max(100, 'Email must be less than 100 characters')
      .email('Please enter a valid email.')
      .optional(),
    name: z
      .string()
      .max(100, 'Agency name must be less than 100 characters')
      .nonempty('An agency name is required.'),
    addressTo: z
      .string()
      .max(100, 'Email addressed to must be less than 100 characters')
      .optional(),
    code: z.string().nonempty('An agency code is required.'),
    sendEmail: z.boolean(),
  })
  .refine((data) => !(data.sendEmail && (!data.email || !data.addressTo)), {
    message: 'Email address and addressTo are required',
    path: ['email', 'addressTo'],
  });

export const AdministrativeAreaSchema = z.object({
  name: z.string().nonempty('A name is required for administrative areas'),
});

export const UserSchema = z.object({
  email: z.string().email().max(100, 'Email must be less than 100 characters').nonempty('Required'),
  firstName: z
    .string()
    .max(100, 'First Name must be less than 100 characters')
    .nonempty('Required'),
  middleName: z.string().max(100, 'Middle Name must be less than 100 characters').optional(),
  lastName: z.string().max(100, 'Last Name must be less than 100 characters').nonempty('Required'),
  role: z.number().min(1, 'Invalid Role').nullable().optional(),
  agency: z.number().min(1, 'Invalid Agency').nullable().optional(),
});

export const Address = z.object({
  line1: z.string().max(150, 'Address must be less then 150 characters').nonempty('Required'),
  line2: z.string().max(150, 'Address must be less then 150 characters').optional(),
  administrativeArea: z
    .string()
    .regex(/\d*/, 'Invalid Location')
    .nonempty('Required')
    .nullable()
    .optional(),
  provinceId: z.string().nonempty('Required'),
  postal: z
    .string()
    .optional()
    .refine(
      (value) =>
        value === '' || value === undefined
          ? true
          : /^[a-zA-z][0-9][a-zA-z][\s-]?[0-9][a-zA-z][0-9]$/.test(value),
      'Invalid Postal Code',
    ),
});

const currentYear = moment().year();
export const Financial = z.object({
  year: z.number().optional(),
  date: z.string().nullable().optional(),
  key: z.string().nullable().optional(),
  value: z
    .string()
    .regex(/\d+(\.\d{1,2})?/, 'Only two decimal places are allowed')
    .or(z.null()),
});
const FinancialYear = z.object({
  assessed: Financial,
  appraised: Financial,
  netbook: Financial,
  market: Financial,
});

export const OccupancySchema = z
  .object({
    rentableArea: z.number().min(1, 'Net Usable Area must be greater than 0').optional(),
    totalArea: z.number().optional(),
    buildingTenancy: z.string().max(100, 'Tenancy must be less than 100 characters').optional(),
    buildingTenancyUpdatedOn: z.string().nullable().optional(),
  })
  .refine(
    (data) =>
      (!data.rentableArea ||
        !data.totalArea ||
        (data.rentableArea <= data.totalArea &&
          (data.totalArea === null || data.totalArea >= data.rentableArea))) &&
      (data.buildingTenancy === undefined ||
        data.buildingTenancy.length === 0 ||
        data.buildingTenancyUpdatedOn !== null),
    {
      message: 'Invalid data',
      path: ['rentableArea', 'totalArea', 'buildingTenancyUpdatedOn'],
    },
  );

export const BuildingInformationSchema = z
  .object({
    name: z.string().max(150, 'Name must be less than 150 characters').nullable().optional(),
    description: z
      .string()
      .max(2000, 'Description must be less than 2000 characters')
      .nullable()
      .optional(),
    latitude: z.number().min(-90, 'Invalid Latitude').max(90, 'Invalid Latitude').optional(),
    longitude: z.number().min(-180, 'Invalid Longitude').max(180, 'Invalid Longitude').optional(),
    buildingConstructionTypeId: z
      .string()
      .regex(/\d*/, 'Invalid Building Construction Type')
      .nullable()
      .optional(),
    buildingPredominateUseId: z
      .string()
      .regex(/\d*/, 'Invalid Building Predominate Use')
      .nullable()
      .optional(),
    classificationId: z
      .string()
      .regex(/\d*/, 'Invalid Building Classification Id')
      .or(z.number())
      .nullable()
      .optional(),
    buildingFloorCount: z.number().min(0, 'Floor Count must be a valid number').optional(),
    address: Address,
    agencyId: z.number().optional(),
    isSensitive: z.boolean().or(z.string()).nullable().optional(),
  })
  .refine(
    (data) =>
      data.latitude !== undefined &&
      data.longitude !== undefined &&
      data.buildingConstructionTypeId !== null &&
      data.buildingPredominateUseId !== null &&
      data.classificationId !== null &&
      data.agencyId !== undefined &&
      data.isSensitive !== null,
    {
      message: 'Required',
      path: [
        'latitude',
        'longitude',
        'buildingConstructionTypeId',
        'buildingPredominateUseId',
        'classificationId',
        'agencyId',
        'isSensitive',
      ],
    },
  );

export const BuildingSchema = z.object({
  transferLeaseOnSale: z.boolean().optional(),
  leaseExpiry: z.string().nullable().optional(),
  financials: z
    .array(
      FinancialYear.refine(
        (financial) =>
          financial.assessed.year !== currentYear &&
          financial.appraised.year !== currentYear &&
          financial.netbook.year !== currentYear &&
          financial.market.year !== currentYear,
        { message: 'Year must not be the current year.' },
      ),
    )
    .optional(),
});

export const LandSchema = z.object({
  classificationId: z
    .string()
    .nonempty({ message: 'Required' })
    .refine((value) => /\d*/.test(value), {
      message: 'Invalid Classification',
    })
    .or(z.number())
    .nullable()
    .optional(),
  address: Address,
  name: z.string().max(150, 'Name must be less than 150 characters').nullable().optional(),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .nullable()
    .optional(),
  administrativeArea: z
    .string()
    .max(250, 'Location must be less than 250 characters')
    .nullable()
    .optional(),
  zoning: z.string().max(250, 'Zoning must be less than 250 characters').nullable().optional(),
  zoningPotential: z
    .string()
    .max(250, 'Zoning Potential must be less than 250 characters')
    .nullable()
    .optional(),
  landLegalDescription: z
    .string()
    .max(500, 'Land Legal Description must be less than 500 characters')
    .nullable()
    .optional(),
  latitude: z
    .number()
    .min(-90, 'Invalid Latitude')
    .max(90, 'Invalid Latitude')
    .refine((value) => !isNaN(value), 'Required'),
  longitude: z
    .number()
    .min(-180, 'Invalid Longitude')
    .max(180, 'Invalid Longitude')
    .refine((value) => !isNaN(value), 'Required'),
  landArea: z
    .number()
    .min(0, 'Land Area must be a positive number')
    .refine((value) => !isNaN(value) && value < 200000, 'Please enter a valid number')
    .or(z.string().nonempty('Required')),
  lotSize: z.number().optional(),
  isSensitive: z
    .boolean()
    .or(z.string().nonempty('Required'))
    .refine((value) => value !== undefined, 'Required'),
  parcels: z.array(z.unknown()),
});

// TODO
/**
 * ^^
 * parcels: z.array(z.unknown()).refine((parcels) => {
    // This needs to be moved to where the schema is used.
    if (propertyTypeId === PropertyTypes.SUBDIVISION && parcels.length === 0) {
      return false;
    }
    return true;
  }, 'You must add at least one parent parcel'),
 */

export const ParcelSchema = z
  .object({
    pid: z.string().optional(),
    pin: z.string().or(z.number()).optional(),
    buildings: z.array(z.unknown()),
    financials: z.array(FinancialYear).optional(),
    agencyId: z.number(),
  })
  .refine(
    (data) =>
      (data.pid && data.pid.match(/\d\d\d[\s-]?\d\d\d[\s-]?\d\d\d/)) ||
      (data.pin && String(data.pin).length <= 9),
    {
      message: 'PID or PIN Required',
      path: ['pid', 'pin'],
    },
  )
  .and(LandSchema);

export const FilterBarSchema = z
  .object({
    minLotSize: z.number().positive().max(200000).or(z.string()).optional(),
    maxLotSize: z.number().positive().max(200000).or(z.string()).optional(),
    inEnhancedReferralProcess: z.boolean().optional(),
    inSurplusPropertyProgram: z.boolean().optional(),
    surplusFilter: z.unknown().optional(), // replace with actual schema
  })
  .refine(
    (data) => {
      if (data.minLotSize && data.maxLotSize) {
        return data.maxLotSize > data.minLotSize;
      }
      return true;
    },
    {
      message: 'Must be greater than Min Lot Size',
      path: ['maxLotSize'],
    },
  )
  .refine(
    (data) => {
      if (!data.surplusFilter) return true;

      return data.inEnhancedReferralProcess || data.inSurplusPropertyProgram;
    },
    {
      message: 'ERP or SPL Properties required when using the Surplus Properties filter.',
      path: ['inEnhancedReferralProcess', 'inSurplusPropertyProgram'],
    },
  );

export const AssociatedLandOwnershipSchema = z
  .object({
    type: z.number().int(),
  })
  .refine((data) => data.type !== undefined, {
    message: 'Choose an option',
    path: ['type'],
  });

export const LandUsageSchema = z.object({
  zoning: z.string().max(250).nullable().optional(),
  zoningPotential: z.string().max(250).nullable().optional(),
  classificationId: z
    .string()
    .nullable()
    .optional()
    .refine((id) => id && /^\d*$/.test(id), {
      message: 'Invalid Classification',
      path: ['classificationId'],
    })
    .refine((id) => id !== undefined && id !== null, {
      message: 'Required',
      path: ['classificationId'],
    })
    .or(z.number()),
});

export const ValuationSchema = z.object({
  financials: z
    .array(FinancialYear)
    .refine(
      (financials) =>
        financials.every(
          (financial) =>
            financial.assessed.year !== currentYear &&
            financial.appraised.year !== currentYear &&
            financial.netbook.year !== currentYear &&
            financial.market.year !== currentYear,
        ),
      'Financial year must not be the current year.',
    ),
});

export const LandIdentificationSchema = z.object({
  pid: z
    .string()
    .optional()
    .refine((pid) => pid === undefined || /\d\d\d-\d\d\d-\d\d\d/.test(pid), {
      message: 'PID must be in the format ###-###-###',
      path: ['pid'],
    }),
  pin: z
    .string()
    .or(z.number())
    .optional()
    .refine((pin) => pin === undefined || (typeof pin !== 'number' && pin.length <= 9), {
      message: 'Please enter a valid PIN no longer than 9 digits.',
      path: ['pin'],
    }),
  address: Address,
  name: z.string().max(150).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  landLegalDescription: z.string().max(500).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  landArea: z.number().min(0).max(200000).nullable().optional(),
  agencyId: z.number().nullable().optional(),
  lotSize: z.number().nullable().optional(),
  isSensitive: z.boolean().or(z.string()).nullable().optional(),
  parcels: z.array(ParcelSchema),
});

// TODO
/** ^^
 * .refine(
      (parcels) => propertyTypeId !== PropertyTypes.SUBDIVISION || parcels.length > 0,
      'You must add at least one parent parcel',
    )
 */

export const AssociatedLandSchema = z.object({
  data: z.object({
    parcels: z.array(ParcelSchema),
  }),
});
