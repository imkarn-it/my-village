"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
SelectValue,
} from "@/components/ui/select"

type Unit = {
    id: string
    unitNumber: string
    building: string
    floor: number
}

export default function NewResidentPage() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [units, setUnits] = useState<Unit[]>([])
    const [loadingUnits, setLoadingUnits] = useState(true)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        unitId: "",
    })

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const { data } = await api.units.get({
                    query: { limit: "100" }
                })
                if (data && data.success && Array.isArray(data.data)) {
                    setUnits(data.data)
                }
            } catch (error) {
                console.error("Failed to fetch units:", error)
                toast.error("ไม่สามารถโหลดข้อมูลห้องพักได้")
            } finally {
                setLoadingUnits(false)
            }
        }
        fetchUnits()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        try {
            const { data, error } = await api.residents.post({
                ...formData,
                role: "resident",
                // projectId will be handled by backend or default
            })

            if (error) {
                throw new Error(String(error.value))
            }

            if (data && data.success) {
                toast.success("เพิ่มลูกบ้านเรียบร้อยแล้ว")
                router.push("/admin/residents")
                router.refresh()
            }
        } catch (err: any) {
            console.error("Error creating resident:", err)
            toast.error(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล")
        } finally {
            setIsPending(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/residents">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        เพิ่มลูกบ้านใหม่
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        สร้างบัญชีผู้ใช้งานสำหรับลูกบ้าน
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="ระบุชื่อ-นามสกุล"
                                        className="pl-10"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unitId">
                                    เลขห้อง <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                    <div className="pl-0">
                                        <Select
                                            value={formData.unitId}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, unitId: value }))}
                                            required
                                        >
                                            <SelectTrigger className="pl-10 w-full">
                                                <SelectValue placeholder={loadingUnits ? "กำลังโหลด..." : "เลือกห้องพัก"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem key={unit.id} value={unit.id}>
                                                        {unit.unitNumber} (ชั้น {unit.floor})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    อีเมล <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        className="pl-10"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        placeholder="08x-xxx-xxxx"
                                        className="pl-10"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="password">
                                    รหัสผ่านเริ่มต้น <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                                        className="pl-10"
                                        required
                                        minLength={6}
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        บันทึกข้อมูล
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
