import { useState, useEffect, useRef } from 'react';
import { WasteReason } from '../data/mockData';
import { getWasteReasons, addWasteReason, updateWasteReason, deleteWasteReason } from '../data/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Plus, Edit2, Trash2, GripVertical, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { Identifier, XYCoord } from 'dnd-core';

interface DraggableReasonProps {
  reason: WasteReason;
  index: number;
  moveReason: (dragIndex: number, hoverIndex: number) => void;
  editingId: string | null;
  editName: string;
  setEditName: (name: string) => void;
  handleEdit: (reason: WasteReason) => void;
  handleSaveEdit: (id: string) => void;
  handleCancelEdit: () => void;
  handleToggleActive: (reason: WasteReason) => void;
  handleDelete: (id: string) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

function DraggableReason({
  reason,
  index,
  moveReason,
  editingId,
  editName,
  setEditName,
  handleEdit,
  handleSaveEdit,
  handleCancelEdit,
  handleToggleActive,
  handleDelete,
}: DraggableReasonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: 'reason',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveReason(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'reason',
    item: () => {
      return { id: reason.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      style={{ opacity }}
      className={`bg-white border rounded-lg p-4 transition-all ${
        !reason.isActive ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div className="text-gray-400 cursor-move">
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Active Checkbox */}
        <Checkbox
          checked={reason.isActive}
          onCheckedChange={() => handleToggleActive(reason)}
          id={`active-${reason.id}`}
        />

        {/* Name - Editable or Display */}
        {editingId === reason.id ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit(reason.id);
                if (e.key === 'Escape') handleCancelEdit();
              }}
              autoFocus
              className="flex-1"
            />
            <Button
              onClick={() => handleSaveEdit(reason.id)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleCancelEdit}
              size="sm"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <span className={`font-medium ${!reason.isActive ? 'text-gray-400' : 'text-[#4A3728]'}`}>
                {reason.name}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                onClick={() => handleEdit(reason)}
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:text-[#4A7C59]"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleDelete(reason.id)}
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function WasteReasonsManager() {
  const [reasons, setReasons] = useState<WasteReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newReasonName, setNewReasonName] = useState('');
  const [hasReordered, setHasReordered] = useState(false);

  useEffect(() => {
    loadReasons();
  }, []);

  const loadReasons = async () => {
    try {
      const loadedReasons = await getWasteReasons();
      setReasons(loadedReasons);
    } catch (error) {
      console.error('Failed to load waste reasons:', error);
      toast.error('Failed to load waste reasons');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newReasonName.trim()) {
      toast.error('Please enter a reason name');
      return;
    }

    try {
      const maxSortOrder = reasons.length > 0 
        ? Math.max(...reasons.map(r => r.sortOrder))
        : 0;

      await addWasteReason({
        name: newReasonName.trim(),
        isActive: true,
        sortOrder: maxSortOrder + 1,
      });

      await loadReasons();
      setNewReasonName('');
      setIsAdding(false);
      toast.success('Waste reason added');
    } catch (error) {
      console.error('Failed to add waste reason:', error);
      toast.error('Failed to add waste reason');
    }
  };

  const handleEdit = (reason: WasteReason) => {
    setEditingId(reason.id);
    setEditName(reason.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      toast.error('Please enter a reason name');
      return;
    }

    try {
      await updateWasteReason(id, { name: editName.trim() });
      await loadReasons();
      setEditingId(null);
      setEditName('');
      toast.success('Waste reason updated');
    } catch (error) {
      console.error('Failed to update waste reason:', error);
      toast.error('Failed to update waste reason');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleToggleActive = async (reason: WasteReason) => {
    try {
      await updateWasteReason(reason.id, { isActive: !reason.isActive });
      await loadReasons();
      toast.success(reason.isActive ? 'Reason deactivated' : 'Reason activated');
    } catch (error) {
      console.error('Failed to toggle reason:', error);
      toast.error('Failed to update reason');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this waste reason? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteWasteReason(id);
      await loadReasons();
      toast.success('Waste reason deleted');
    } catch (error) {
      console.error('Failed to delete waste reason:', error);
      toast.error('Failed to delete waste reason');
    }
  };

  const moveReason = (dragIndex: number, hoverIndex: number) => {
    const newReasons = [...reasons];
    const draggedItem = newReasons[dragIndex];
    
    // Remove the dragged item
    newReasons.splice(dragIndex, 1);
    
    // Insert it at the new position
    newReasons.splice(hoverIndex, 0, draggedItem);
    
    // Update sortOrder for all items based on new positions
    const reorderedReasons = newReasons.map((reason, index) => ({
      ...reason,
      sortOrder: index + 1,
    }));
    
    setReasons(reorderedReasons);
    setHasReordered(true);
  };

  // Save reordering when drag ends
  useEffect(() => {
    const saveOrder = async () => {
      try {
        // Save each reason with its new sortOrder
        for (const reason of reasons) {
          await updateWasteReason(reason.id, { sortOrder: reason.sortOrder });
        }
      } catch (error) {
        console.error('Failed to save order:', error);
      }
    };

    // Debounce the save to avoid too many API calls
    const timeoutId = setTimeout(() => {
      if (reasons.length > 0 && hasReordered) {
        saveOrder();
        setHasReordered(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [reasons, hasReordered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#4A3728]">Waste Reasons</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage reasons for waste logging
          </p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-[#4A7C59] hover:bg-[#3A6C49]"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reason
        </Button>
      </div>

      {/* Add New Reason Form */}
      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter reason name..."
              value={newReasonName}
              onChange={(e) => setNewReasonName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewReasonName('');
                }
              }}
              autoFocus
              className="flex-1"
            />
            <Button
              onClick={handleAdd}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewReasonName('');
              }}
              size="sm"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reasons List */}
      <div className="space-y-2">
        {reasons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No waste reasons configured</p>
            <p className="text-sm mt-1">Click "Add Reason" to create one</p>
          </div>
        ) : (
          <DndProvider backend={HTML5Backend}>
            {reasons.map((reason, index) => (
              <DraggableReason
                key={reason.id}
                reason={reason}
                index={index}
                moveReason={moveReason}
                editingId={editingId}
                editName={editName}
                setEditName={setEditName}
                handleEdit={handleEdit}
                handleSaveEdit={handleSaveEdit}
                handleCancelEdit={handleCancelEdit}
                handleToggleActive={handleToggleActive}
                handleDelete={handleDelete}
              />
            ))}
          </DndProvider>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Inactive reasons won't appear in waste logging forms,
          but existing entries with these reasons will still be visible in reports.
        </p>
      </div>
    </div>
  );
}