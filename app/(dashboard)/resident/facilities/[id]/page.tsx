"use client";

import React, { use } from "react";
import { MapPin, Users, Info, ArrowLeft, Check, Star, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import type { Facility as DBFacility, Booking } from "@/types";

// Extended facility type with UI properties
type Facility = DBFacility & {
  type?: string;
  location?: string;
  capacity?: number;
  status?: string;
  operatingHours?: {
    open: string;
    close: string;
  };
  amenities?: string[];
  rules?: string[];
  bookingSettings?: {
    maxAdvanceDays: number;
    minBookingHours: number;
    maxBookingHours: number;
    maxConcurrentBookings: number;
    allowedTimeSlots: string[];
  };
  stats?: {
    totalBookings: number;
    averageRating: number;
    currentOccupancy: number;
    monthlyBookings: number;
  };
};

// Extended booking type with joined data for display
type FacilityBooking = Booking & {
  facilityName: string;
  facilityImage?: string;
  facilityLocation: string;
  userName: string;
  userUnit: string;
  participants?: number;
  totalAmount?: number;
  notes?: string;
  qrCode: string;
  updatedAt?: string;
};

// Sample data - in real app, this would come from API
const facilities: Record<string, Facility> = {
  "1": {
    id: "1",
    projectId: "project-1",
    name: "สระว่ายน้ำ",
    description: "สระว่ายน้ำขนาดใหญ่พร้อมเก้าอี้อาบแดด และห้องล็อกเกอร์",
    isActive: true,
    image: "/facilities/swimming-pool.jpg",
    openTime: "06:00",
    closeTime: "21:00",
    maxCapacity: 50,
    requiresApproval: false,
    type: "swimming_pool",
    location: "ชั้น G ใกล้สวนสาธารณะ",
    capacity: 50,
    operatingHours: {
      open: "06:00",
      close: "21:00",
    },
    amenities: ["เก้าอี้อาบแดด", "ห้องล็อกเกอร์", "ฝักบัว", "ตู้เก็บของ", "ใบปิดปากสระว่ายน้ำ"],
    status: "available",
    rules: [
      "สวมชุดว่ายน้ำทุกครั้งก่อนลงสระ",
      "ห้ามนำอาหารและเครื่องดื่มเข้าบริเวณสระ",
      "เด็กที่มีความสูงต่ำกว่า 120 ซม. ต้องมีผู้ดูแล",
      "ห้ามวิ่งเล่นรอบสระว่ายน้ำ",
      "ใช้ผ้าเช็ดตัวที่ทางโครงการจัดเตรียมไว้เท่านั้น",
    ],
    bookingSettings: {
      maxAdvanceDays: 7,
      minBookingHours: 1,
      maxBookingHours: 3,
      maxConcurrentBookings: 20,
      allowedTimeSlots: [
        "06:00-08:00",
        "08:00-10:00",
        "10:00-12:00",
        "12:00-14:00",
        "14:00-16:00",
        "16:00-18:00",
        "18:00-20:00",
        "20:00-21:00",
      ],
    },
    stats: {
      totalBookings: 1250,
      averageRating: 4.8,
      currentOccupancy: 12,
      monthlyBookings: 180,
    },
  },
  "2": {
    id: "2",
    projectId: "project-1",
    name: "ฟิตเนส",
    description: "ห้องออกกำลังกายพร้อมอุปกรณ์ครบครัน",
    isActive: true,
    image: "/facilities/fitness.jpg",
    openTime: "05:00",
    closeTime: "22:00",
    maxCapacity: 30,
    requiresApproval: false,
    type: "fitness",
    location: "ชั้น 2",
    capacity: 30,
    operatingHours: {
      open: "05:00",
      close: "22:00",
    },
    amenities: ["เครื่องออกกำลังกาย", "ห้องโยคะ", "ห้องซาวน่า", "ตู้น้ำดื่ม", "ล็อกเกอร์"],
    status: "available",
    rules: [
      "สวมรองเท้ากีฬาทุกครั้ง",
      "เช็ดอุปกรณ์หลังใช้งาน",
      "ควบคุมเสียงดัง",
      "แต่งตัวเหมาะสม",
    ],
    bookingSettings: {
      maxAdvanceDays: 3,
      minBookingHours: 1,
      maxBookingHours: 2,
      maxConcurrentBookings: 25,
      allowedTimeSlots: [
        "05:00-07:00",
        "07:00-09:00",
        "09:00-11:00",
        "11:00-13:00",
        "13:00-15:00",
        "15:00-17:00",
        "17:00-19:00",
        "19:00-21:00",
        "21:00-22:00",
      ],
    },
    stats: {
      totalBookings: 2100,
      averageRating: 4.6,
      currentOccupancy: 18,
      monthlyBookings: 320,
    },
  },
  "3": {
    id: "3",
    projectId: "project-1",
    name: "ห้องประชุม",
    description: "ห้องประชุมสำหรับจัดกิจกรรมหรือประชุมสมาคม",
    isActive: true,
    image: "/facilities/meeting-room.jpg",
    openTime: "08:00",
    closeTime: "21:00",
    maxCapacity: 100,
    requiresApproval: true,
    type: "meeting_room",
    location: "ชั้น 3",
    capacity: 100,
    operatingHours: {
      open: "08:00",
      close: "21:00",
    },
    amenities: ["โปรเจคเตอร์", "ระบบเสียง", "ไมโครโฟน", "อินเทอร์เน็ต WiFi", "ที่นั่ง", "โต๊ะ"],
    status: "available",
    rules: [
      "ต้องจองล่วงหน้าอย่างน้อย 3 วัน",
      "ห้ามนำอาหารที่มีกลิ่นเข้าห้อง",
      "รักษาความสะอาดหลังใช้งาน",
      "ปิดเครื่องใช้ไฟฟ้าทุกครั้ง",
    ],
    bookingSettings: {
      maxAdvanceDays: 30,
      minBookingHours: 2,
      maxBookingHours: 8,
      maxConcurrentBookings: 1,
      allowedTimeSlots: [
        "08:00-10:00",
        "10:00-12:00",
        "13:00-15:00",
        "15:00-17:00",
        "18:00-20:00",
      ],
    },
    stats: {
      totalBookings: 45,
      averageRating: 4.9,
      currentOccupancy: 0,
      monthlyBookings: 8,
    },
  },
};

const upcomingBookings: Record<string, FacilityBooking[]> = {
  "1": [
    {
      id: "1",
      facilityId: "1",
      unitId: "unit-1",
      userId: "user1",
      bookingDate: "2025-01-15",
      startTime: "08:00:00",
      endTime: "10:00:00",
      status: "approved",
      createdAt: new Date("2025-01-14T10:00:00Z"),
      facilityName: "สระว่ายน้ำ",
      facilityLocation: "ชั้น G ใกล้สวนสาธารณะ",
      userName: "สมชาย ใจดี",
      userUnit: "A/101",
      participants: 2,
      totalAmount: 0,
      qrCode: "BK20250115001",
    },
    {
      id: "2",
      facilityId: "1",
      unitId: "unit-2",
      userId: "user2",
      bookingDate: "2025-01-15",
      startTime: "14:00:00",
      endTime: "16:00:00",
      status: "approved",
      createdAt: new Date("2025-01-14T12:00:00Z"),
      facilityName: "สระว่ายน้ำ",
      facilityLocation: "ชั้น G ใกล้สวนสาธารณะ",
      userName: "มานี รักสวย",
      userUnit: "B/205",
      participants: 3,
      totalAmount: 0,
      qrCode: "BK20250115002",
    },
  ],
};

type Review = {
  id: string;
  userId: string;
  userName: string;
  userUnit: string;
  rating: number;
  comment: string;
  date: string;
};

const reviews: Record<string, Review[]> = {
  "1": [
    {
      id: "1",
      userId: "user3",
      userName: "วิชัย รักการออกกำลังกาย",
      userUnit: "C/302",
      rating: 5,
      comment: "สระสะอาดมาก น้ำใส มีเก้าอี้อาบแดดเพียบพอ ชอบมากครับ",
      date: "2025-01-10",
    },
    {
      id: "2",
      userId: "user4",
      userName: "สมศรี ใจดี",
      userUnit: "D/150",
      rating: 4,
      comment: "สระสะอาด แต่คนเยอะตอนชั่วโมงเย็น น่าจะจำกัดจำนวนคนดีกว่า",
      date: "2025-01-08",
    },
  ],
};

export default function FacilityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const facility = facilities[id];

  if (!facility) {
    notFound();
  }

  const handleBooking = () => {
    window.location.href = `/resident/facilities/${id}/book`;
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-gray-800";
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case "available":
        return "ว่าง";
      case "maintenance":
        return "กำลังปรับปรุง";
      case "closed":
        return "ปิดให้บริการ";
      default:
        return status;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ));
  };

  const facilityUpcomingBookings = upcomingBookings[id] || [];
  const facilityReviews = reviews[id] || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/resident/facilities"
          className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          กลับไปหน้ารายการสิ่งอำนวยความสะดวก
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{facility.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">{facility.location}</span>
              <Badge className={getStatusColor(facility.status)}>
                {getStatusText(facility.status)}
              </Badge>
            </div>
          </div>
          <Button
            onClick={handleBooking}
            disabled={facility.status !== "available"}
            size="lg"
          >
            {facility.status === "available" ? "จองเลย" : "ไม่สามารถจองได้"}
          </Button>
        </div>
      </div>

      {/* Facility Image */}
      <div className="mb-6">
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
          {facility.image ? (
            <Image
              src={facility.image}
              alt={facility.name}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Info className="h-12 w-12 text-slate-400" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>ข้อมูลสิ่งอำนวยความสะดวก</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300">{facility.description}</p>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">รายละเอียด</TabsTrigger>
              <TabsTrigger value="schedule">กำหนดการ</TabsTrigger>
              <TabsTrigger value="upcoming">การจองวันนี้</TabsTrigger>
              <TabsTrigger value="reviews">รีวิว</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">ข้อมูลพื้นฐาน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">ความจุ</span>
                    </div>
                    <span>{facility.capacity} คน</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">เวลาทำการ</span>
                    </div>
                    <span>
                      {facility.operatingHours?.open} - {facility.operatingHours?.close}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">กำลังใช้งาน</span>
                    </div>
                    <span>{facility.stats?.currentOccupancy || 0}/{facility.capacity} คน</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">สิ่งอำนวยความสะดวก</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {facility.amenities?.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">กฎระเบียบการใช้งาน</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {facility.rules?.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>เวลาที่เปิดให้จอง</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {facility.bookingSettings?.allowedTimeSlots?.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="font-medium">{slot}</span>
                        <Badge variant="outline">ว่าง</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">เงื่อนไขการจอง</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• จองล่วงหน้าได้สูงสุด {facility.bookingSettings?.maxAdvanceDays} วัน</li>
                      <li>• จองขั้นต่ำ {facility.bookingSettings?.minBookingHours} ชั่วโมง</li>
                      <li>• จองต่อเนื่องได้สูงสุด {facility.bookingSettings?.maxBookingHours} ชั่วโมง</li>
                      <li>• รับจองได้สูงสุด {facility.bookingSettings?.maxConcurrentBookings} คนต่อช่วงเวลา</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>การจองในวันนี้</CardTitle>
                </CardHeader>
                <CardContent>
                  {facilityUpcomingBookings.length > 0 ? (
                    <div className="space-y-3">
                      {facilityUpcomingBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={`/avatars/${booking.userId}.jpg`} />
                              <AvatarFallback>
                                {booking.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{booking.userName}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {booking.userUnit} • {booking.participants} คน
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}
                            </p>
                            <Badge variant={booking.status === "approved" ? "default" : "secondary"}>
                              {booking.status === "approved" ? "อนุมัติแล้ว" : booking.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                      ไม่มีการจองในวันนี้
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>รีวิวจากผู้ใช้งาน</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-yellow-500">
                        {facility.stats?.averageRating || 0}
                      </span>
                      <div className="flex">{renderStars(Math.round(facility.stats?.averageRating || 0))}</div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        ({facilityReviews.length} รีวิว)
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {facilityReviews.length > 0 ? (
                    <div className="space-y-4">
                      {facilityReviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={`/avatars/${review.userId}.jpg`} />
                                <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{review.userName}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{review.userUnit}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex">{renderStars(review.rating)}</div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{review.date}</p>
                            </div>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                      ยังไม่มีรีวิว
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>สถิติการใช้งาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">การจองทั้งหมด</span>
                <span className="font-medium">{facility.stats?.totalBookings || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">เดือนนี้</span>
                <span className="font-medium">{facility.stats?.monthlyBookings || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">คะแนนเฉลี่ย</span>
                <span className="font-medium">{facility.stats?.averageRating || 0}/5.0</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>จองด่วน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={handleBooking}>
                จองวันนี้
              </Button>
              <Link href={`/resident/facilities/${id}/book`}>
                <Button className="w-full" variant="outline">
                  ดูตารางว่าง
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>ติดต่อสอบถาม</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-slate-600 dark:text-slate-400">
                สำหรับข้อมูลเพิ่มเติม หรือปัญหาการใช้งาน
              </p>
              <Link href="/resident/support/new">
                <Button className="w-full" variant="outline" size="sm">
                  ติดต่อแอดมิน
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}