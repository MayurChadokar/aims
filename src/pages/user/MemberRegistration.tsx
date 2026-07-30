import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createMember, fetchSatsangPlaces, fetchMasterSettings } from '../../services/api';
import { calculateAge, calculateExpiryDate, formatDateDisplay } from '../../utils/dateUtils';
import { SatsangPlace, MasterSettings, DesignationType, ApprovalPeriodType } from '../../types';
import toast from 'react-hot-toast';
import { CheckCircle2, User, Calendar, FileText, IdCard, Award, Send } from 'lucide-react';
import { motion } from 'framer-motion';

// Zod Validation Schema
const memberFormSchema = z.object({
  area: z.string().min(1, 'Area is required'),
  satsang_place: z.string().min(1, 'Name of Satsang Place is required'),
  status: z.enum(['POINT', 'CENTRE', 'SUB CENTRE', 'Active', 'Pending', 'Temporary']),
  designation: z.enum(['Satsang Karta', 'Reader', 'Pathi']),
  name: z.string().min(2, 'Name is required'),
  father_name: z.string().min(2, 'Father/Husband Name is required'),
  gender: z.enum(['Male', 'Female']),
  dob: z.string().min(1, 'Date of Birth is required'),
  qualification: z.string().optional(),
  approval_letter_number: z.string().min(1, 'Approval Letter Number is required'),
  approval_date: z
    .string()
    .min(1, 'Date of Approval is required')
    .refine((dateStr) => new Date(dateStr) <= new Date(), {
      message: 'Approval Date cannot be a future date',
    }),
  approval_period: z.enum([
    '6 Months',
    '1 Year',
    '2 Years',
    '3 Years',
    '4 Years',
    '5 Years',
    '6 Years',
  ]),
  aadhaar: z
    .string()
    .regex(/^\d{12}$/, 'Aadhaar must contain exactly 12 digits (numbers only)'),
});

type MemberFormData = z.infer<typeof memberFormSchema>;

export const MemberRegistration: React.FC = () => {
  const [satsangPlaces, setSatsangPlaces] = useState<SatsangPlace[]>([]);
  const [masterSettings, setMasterSettings] = useState<MasterSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      area: 'Pithampur',
      satsang_place: '',
      status: 'POINT',
      designation: 'Satsang Karta',
      name: '',
      father_name: '',
      gender: 'Male',
      dob: '',
      qualification: '',
      approval_letter_number: '',
      approval_date: new Date().toISOString().slice(0, 10),
      approval_period: '2 Years',
      aadhaar: '',
    },
  });

  // Watch form values for auto-calculations
  const selectedPlaceName = useWatch({ control, name: 'satsang_place' });
  const selectedDob = useWatch({ control, name: 'dob' });
  const selectedApprovalDate = useWatch({ control, name: 'approval_date' });
  const selectedApprovalPeriod = useWatch({ control, name: 'approval_period' });

  // Auto Age & Expiry calculations
  const calculatedAge = selectedDob ? calculateAge(selectedDob) : 0;
  const calculatedExpiryDate =
    selectedApprovalDate && selectedApprovalPeriod
      ? calculateExpiryDate(selectedApprovalDate, selectedApprovalPeriod as ApprovalPeriodType)
      : '';

  // Load initial dropdown options
  useEffect(() => {
    async function loadOptions() {
      const places = await fetchSatsangPlaces();
      const settings = await fetchMasterSettings();
      setSatsangPlaces(places);
      setMasterSettings(settings);

      // Set default place if available
      if (places.length > 0 && !selectedPlaceName) {
        setValue('satsang_place', places[0].name);
        setValue('status', places[0].status);
      }
    }
    loadOptions();
  }, [setValue]);

  // Auto populate Satsang Place Status when selected place changes
  useEffect(() => {
    if (selectedPlaceName && satsangPlaces.length > 0) {
      const matchedPlace = satsangPlaces.find((p) => p.name === selectedPlaceName);
      if (matchedPlace) {
        setValue('status', matchedPlace.status);
      }
    }
  }, [selectedPlaceName, satsangPlaces, setValue]);

  const onSubmit = async (data: MemberFormData) => {
    setIsSubmitting(true);
    try {
      await createMember({
        ...data,
        age: calculatedAge,
        expiry_date: calculatedExpiryDate,
        qualification: data.qualification || '',
      });

      toast.success('Form Submitted Successfully!', {
        duration: 4000,
        icon: '🎉',
      });

      reset({
        area: 'Pithampur',
        satsang_place: satsangPlaces[0]?.name || '',
        status: satsangPlaces[0]?.status || 'POINT',
        designation: 'Satsang Karta',
        name: '',
        father_name: '',
        gender: 'Male',
        dob: '',
        qualification: '',
        approval_letter_number: '',
        approval_date: new Date().toISOString().slice(0, 10),
        approval_period: '2 Years',
        aadhaar: '',
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4 font-sans"
    >
      {/* Page Title Card */}
      <div className="bg-white p-5 rounded-2xl shadow-gov border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Member Registration Form
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Fill out all required details accurately. Expiry date and age will be calculated automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Section 1: Location & Place Details */}
        <div className="bg-white p-5 rounded-2xl shadow-gov border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Area & Satsang Place
          </h3>

          {/* Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Area *</label>
            <select
              {...register('area')}
              className="w-full h-12 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            >
              {masterSettings?.areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              )) || <option value="Pithampur">Pithampur</option>}
            </select>
            {errors.area && <p className="text-xs text-rose-600 mt-1">{errors.area.message}</p>}
          </div>

          {/* Satsang Place */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Name of Satsang Place *
            </label>
            <select
              {...register('satsang_place')}
              className="w-full h-12 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            >
              {satsangPlaces.map((sp) => (
                <option key={sp.id} value={sp.name}>
                  {sp.name}
                </option>
              ))}
            </select>
            {errors.satsang_place && (
              <p className="text-xs text-rose-600 mt-1">{errors.satsang_place.message}</p>
            )}
          </div>

          {/* Auto Status (Read Only) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Auto Status (Read Only)
            </label>
            <input
              type="text"
              readOnly
              {...register('status')}
              className="w-full h-12 px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
            />
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Designation *</label>
            <select
              {...register('designation')}
              className="w-full h-12 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            >
              <option value="Satsang Karta">Satsang Karta</option>
              <option value="Reader">Reader</option>
              <option value="Pathi">Pathi</option>
            </select>
          </div>
        </div>

        {/* Section 2: Personal Information */}
        <div className="bg-white p-5 rounded-2xl shadow-gov border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Personal Details
          </h3>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Kumar"
              {...register('name')}
              className="w-full h-12 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
          </div>

          {/* Father/Husband Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Father Name / Husband Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Suresh Kumar"
              {...register('father_name')}
              className="w-full h-12 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            />
            {errors.father_name && (
              <p className="text-xs text-rose-600 mt-1">{errors.father_name.message}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
            <select
              {...register('gender')}
              className="w-full h-12 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Date of Birth & Auto Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                {...register('dob')}
                className="w-full h-12 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
              />
              {errors.dob && <p className="text-xs text-rose-600 mt-1">{errors.dob.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age (Read Only)</label>
              <input
                type="text"
                readOnly
                value={calculatedAge > 0 ? `${calculatedAge} Yrs` : '-'}
                className="w-full h-12 px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-blue-700 cursor-not-allowed text-center"
              />
            </div>
          </div>

          {/* Qualification */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Qualification</label>
            <input
              type="text"
              placeholder="e.g. B.A., M.A., B.Tech"
              {...register('qualification')}
              className="w-full h-12 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            />
          </div>

          {/* Aadhaar Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Aadhaar Number (12 Digits) *
            </label>
            <input
              type="text"
              maxLength={12}
              placeholder="123456789012"
              {...register('aadhaar')}
              className="w-full h-12 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-wider text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            />
            {errors.aadhaar && (
              <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.aadhaar.message}</p>
            )}
          </div>
        </div>

        {/* Section 3: Tenure & Approval Details */}
        <div className="bg-white p-5 rounded-2xl shadow-gov border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Approval & Tenure Calculation
          </h3>

          {/* Approval Letter Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Approval Letter Number *
            </label>
            <input
              type="text"
              placeholder="e.g. AP-2025-001"
              {...register('approval_letter_number')}
              className="w-full h-12 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            />
            {errors.approval_letter_number && (
              <p className="text-xs text-rose-600 mt-1">{errors.approval_letter_number.message}</p>
            )}
          </div>

          {/* Date of Approval */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date of Approval *</label>
            <input
              type="date"
              {...register('approval_date')}
              className="w-full h-12 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            />
            {errors.approval_date && (
              <p className="text-xs text-rose-600 mt-1">{errors.approval_date.message}</p>
            )}
          </div>

          {/* Approval Period */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Approval Period *</label>
            <select
              {...register('approval_period')}
              className="w-full h-12 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
            >
              <option value="6 Months">6 Months</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
              <option value="3 Years">3 Years</option>
              <option value="4 Years">4 Years</option>
              <option value="5 Years">5 Years</option>
              <option value="6 Years">6 Years</option>
            </select>
          </div>

          {/* Auto Expiry Date Calculation (Read Only) */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-1">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
              Auto Expiry Date Calculation (Read Only)
            </span>
            <div className="text-lg font-extrabold text-gov-blue">
              {calculatedExpiryDate ? formatDateDisplay(calculatedExpiryDate) : 'Select Approval Date & Period'}
            </div>
            <p className="text-[11px] text-blue-700 font-medium">
              Formula: Date of Approval + Approval Period = Expiry Date
            </p>
          </div>
        </div>

        {/* Sticky Mobile Submit Button */}
        <div className="sticky bottom-4 z-30 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-gov-blue hover:bg-blue-800 text-white font-bold text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Member Form</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
