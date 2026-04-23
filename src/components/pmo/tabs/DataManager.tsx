'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { uid } from '@/lib/pmo-utils';
import type { PMOData } from '@/types/pmo';

type DataKey = keyof PMOData;
type DataRow = { id: string; [k: string]: unknown };

interface DataManagerProps {
  data: PMOData;
  canEdit: boolean;
  onReplace: <K extends DataKey>(key: K, items: PMOData[K]) => void;
}

const SECTION_LABELS: { key: DataKey; label: string }[] = [
  { key: 'portfolios', label: 'Portfolios' },
  { key: 'programs', label: 'Programs' },
  { key: 'projects', label: 'Projects' },
  { key: 'risks', label: 'Risks' },
  { key: 'issues', label: 'Issues' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'weeklyNotes', label: 'Weekly Notes' },
];

const pretty = (val: unknown) => JSON.stringify(val, null, 2);

export function DataManager({ data, canEdit, onReplace }: DataManagerProps) {
  const [section, setSection] = useState<DataKey>('portfolios');
  const [newJson, setNewJson] = useState('');
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingJson, setEditingJson] = useState('');

  const rows = useMemo(
    () => (data[section] as Array<{ id: string }>).map(row => row as unknown as DataRow),
    [data, section]
  );

  const updateRows = (nextRows: DataRow[]) => {
    onReplace(section, nextRows as unknown as PMOData[typeof section]);
  };

  const addRow = () => {
    try {
      const parsed = JSON.parse(newJson || '{}') as Record<string, unknown>;
      const next: DataRow = {
        ...parsed,
        id: typeof parsed.id === 'string' && parsed.id ? parsed.id : uid(),
      };
      updateRows([...rows, next]);
      setNewJson('');
      setError('');
    } catch {
      setError('JSON ไม่ถูกต้อง กรุณาตรวจสอบ format ก่อนเพิ่มรายการ');
    }
  };

  const removeRow = (id: string) => {
    if (!confirm(`ต้องการลบรายการ id: ${id} ?`)) return;
    updateRows(rows.filter(r => r.id !== id));
  };

  const openEdit = (row: DataRow) => {
    setEditingId(row.id);
    setEditingJson(pretty(row));
    setError('');
    setOpen(true);
  };

  const saveEdit = () => {
    if (!editingId) return;
    try {
      const parsed = JSON.parse(editingJson) as Record<string, unknown>;
      const fixedId = typeof parsed.id === 'string' && parsed.id ? parsed.id : editingId;
      const updated: DataRow = { ...parsed, id: fixedId };
      updateRows(rows.map(r => (r.id === editingId ? updated : r)));
      setOpen(false);
      setEditingId(null);
      setEditingJson('');
      setError('');
    } catch {
      setError('JSON ไม่ถูกต้อง ไม่สามารถบันทึกการแก้ไขได้');
    }
  };

  const preview = (row: DataRow) => {
    const label = (row.name ?? row.title ?? row.decisions ?? '').toString();
    if (label) return label.length > 55 ? `${label.slice(0, 55)}...` : label;
    return pretty(row).slice(0, 55).replace(/\s+/g, ' ');
  };

  useEffect(() => {
    if (!canEdit) {
      setOpen(false);
      setEditingId(null);
      setEditingJson('');
      setError('');
    }
  }, [canEdit]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mockup Data Manager</CardTitle>
          <CardDescription>
            เพิ่ม แก้ไข และลบข้อมูลรายรายการของทุกชุดข้อมูลใน `seeds` แล้วบันทึกเข้า local storage ทันที
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SECTION_LABELS.map(s => (
              <Button
                key={s.key}
                size="sm"
                variant={s.key === section ? 'default' : 'outline'}
                className={s.key === section ? 'bg-[#D4382C] text-white hover:bg-[#c03020]' : ''}
                onClick={() => {
                  setSection(s.key);
                  setNewJson('');
                  setError('');
                }}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มข้อมูลใน {section}</CardTitle>
            <CardDescription>
              ใส่ JSON ของรายการใหม่ (สามารถใส่ `id` เอง หรือปล่อยให้ระบบ generate อัตโนมัติ)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={newJson}
              onChange={e => setNewJson(e.target.value)}
              rows={8}
              placeholder={'{\n  "name": "ตัวอย่าง"\n}'}
              className="font-mono text-xs"
            />
            <div className="flex items-center gap-2">
              <Button onClick={addRow} className="bg-[#1A2744] text-white hover:bg-[#121d33]">+ Add Item</Button>
              {error && <span className="text-xs text-red-600">{error}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>รายการใน {section} ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead className="w-[180px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.id}</TableCell>
                  <TableCell className="max-w-[720px] truncate">{preview(row)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {canEdit && <Button size="sm" variant="outline" onClick={() => openEdit(row)}>Modify</Button>}
                      {canEdit && <Button size="sm" variant="destructive" onClick={() => removeRow(row.id)}>Delete</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={canEdit && open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Modify Item</DialogTitle>
            <DialogDescription>แก้ JSON แล้วกด Save เพื่ออัปเดตรายการนี้</DialogDescription>
          </DialogHeader>
          <Textarea
            value={editingJson}
            onChange={e => setEditingJson(e.target.value)}
            rows={18}
            className="font-mono text-xs"
          />
          {error && <div className="text-xs text-red-600">{error}</div>}
          <DialogFooter className="justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-[#D4382C] text-white hover:bg-[#c03020]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
