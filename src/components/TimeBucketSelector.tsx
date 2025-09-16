import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface TimeBucketSelectorProps {
  bucket: number
  setBucket: (bucket: number) => void
  bucketUnit: string
  setBucketUnit: (unit: string) => void
}

export default function TimeBucketSelector({ bucket, setBucket, bucketUnit, setBucketUnit }: TimeBucketSelectorProps): JSX.Element {
    // Define bucket unit options with separate label and value
    const bucketUnitOptions = [
        { value: "minutes", label: "Minutes" },
        { value: "hours", label: "Hours" },
        { value: "days", label: "Days" },
        { value: "weeks", label: "Weeks" },
        { value: "months", label: "Months" },
        { value: "years", label: "Years" }
    ];

    return (
        <div className="flex flex-col space-y-2">
            <div className="flex gap-2">
                <Input 
                    type="number" 
                    id="bucket" 
                    name="bucket"
                    value={bucket}
                    min={1}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBucket(Math.max(1, Number(e.target.value || 1)))}
                    placeholder="Size"
                    className="w-24 text-right"
                />
                <Select value={bucketUnit} onValueChange={setBucketUnit}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent className="">
                    {bucketUnitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="">{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
        </div>
    );
}