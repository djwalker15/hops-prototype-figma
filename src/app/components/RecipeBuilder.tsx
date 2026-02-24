import { useState } from 'react';
import { Item } from '../data/mockData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Plus, Trash2, AlertCircle, CheckCircle2, Package } from 'lucide-react';

interface RecipeIngredient {
  itemId: string;
  itemName?: string; // For newly created items
  quantity: number;
  unit: string;
  isNew?: boolean; // Flag for items created during this session
}

interface RecipeBuilderProps {
  existingItems: Item[];
  onSave: (recipeItem: Partial<Item>, newIngredientItems: Partial<Item>[]) => void;
  onCancel: () => void;
  editingItem?: Item | null;
}

export function RecipeBuilder({ existingItems, onSave, onCancel, editingItem }: RecipeBuilderProps) {
  // Main recipe item form state
  const [recipeName, setRecipeName] = useState(editingItem?.name || '');
  const [recipeCategory, setRecipeCategory] = useState<Item['category']>(
    editingItem?.category || 'cocktail'
  );
  const [recipeYield, setRecipeYield] = useState(editingItem?.recipeYield || 1);
  const [currentInventory, setCurrentInventory] = useState(editingItem?.currentInventory || 0);
  const [inventoryUnit, setInventoryUnit] = useState(editingItem?.inventoryUnit || 'servings');

  // Ingredients state
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    editingItem?.ingredients?.map(ing => ({
      ...ing,
      isNew: false,
    })) || []
  );

  // New ingredient items created during this session
  const [newIngredientItems, setNewIngredientItems] = useState<Partial<Item>[]>([]);

  // Quick add ingredient dialog state
  const [quickAddDialogOpen, setQuickAddDialogOpen] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    name: '',
    category: 'spirit' as Item['category'],
    inventoryUnit: 'bottles',
    currentInventory: 0,
  });

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { itemId: '', quantity: 0, unit: 'oz', isNew: false },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleUpdateIngredient = (
    index: number,
    field: keyof RecipeIngredient,
    value: string | number | boolean
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleQuickAddItem = () => {
    if (!quickAddData.name.trim()) return;

    // Create a temporary item
    const newItem: Partial<Item> = {
      id: `temp-${Date.now()}`,
      name: quickAddData.name,
      category: quickAddData.category,
      isActive: true,
      currentInventory: quickAddData.currentInventory,
      inventoryUnit: quickAddData.inventoryUnit,
    };

    // Add to new items list
    setNewIngredientItems([...newIngredientItems, newItem]);

    // Add to ingredients with isNew flag
    setIngredients([
      ...ingredients,
      {
        itemId: newItem.id!,
        itemName: newItem.name,
        quantity: 0,
        unit: 'oz',
        isNew: true,
      },
    ]);

    // Reset and close dialog
    setQuickAddData({
      name: '',
      category: 'spirit',
      inventoryUnit: 'bottles',
      currentInventory: 0,
    });
    setQuickAddDialogOpen(false);
  };

  const handleSaveRecipe = () => {
    if (!recipeName.trim()) {
      alert('Please enter a recipe name');
      return;
    }

    if (ingredients.length === 0) {
      alert('Please add at least one ingredient');
      return;
    }

    // Validate all ingredients have item selected and quantity > 0
    const invalidIngredients = ingredients.filter(
      ing => !ing.itemId || ing.quantity <= 0
    );
    if (invalidIngredients.length > 0) {
      alert('Please complete all ingredient details (item and quantity)');
      return;
    }

    // Create the recipe item
    const recipeItem: Partial<Item> = {
      ...(editingItem && { id: editingItem.id }),
      name: recipeName,
      category: recipeCategory,
      isActive: true,
      currentInventory,
      inventoryUnit,
      hasRecipe: true,
      recipeYield,
      recipe: {
        yield: recipeYield,
        ingredients: ingredients.map(ing => ({
          itemId: ing.itemId,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
      },
      ingredients: ingredients.map(ing => ({
        itemId: ing.itemId,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    };

    onSave(recipeItem, newIngredientItems);
  };

  // Combined list of available items (existing + newly created)
  const allAvailableItems = [
    ...existingItems.filter(item => item.id !== editingItem?.id),
    ...newIngredientItems,
  ];

  const getItemName = (itemId: string) => {
    const item = allAvailableItems.find(i => i.id === itemId);
    return item?.name || 'Unknown';
  };

  const isItemNew = (itemId: string) => {
    return newIngredientItems.some(item => item.id === itemId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <h2 className="text-xl font-bold text-[#4A3728] mb-1">
          {editingItem ? 'Edit Recipe' : 'Create New Recipe'}
        </h2>
        <p className="text-sm text-gray-600">
          Build a complete recipe and create new ingredients on the fly
        </p>
      </div>

      {/* Recipe Details Section */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-[#4A3728]">Recipe Details</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="recipeName">Recipe Name *</Label>
            <Input
              id="recipeName"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="e.g., Spicy Margarita"
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={recipeCategory}
                onValueChange={(value) => setRecipeCategory(value as Item['category'])}
              >
                <SelectTrigger id="category" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cocktail">Cocktail</SelectItem>
                  <SelectItem value="batch">Batch</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yield">Yield (servings) *</Label>
              <Input
                id="yield"
                type="number"
                min="1"
                value={recipeYield}
                onChange={(e) => setRecipeYield(parseInt(e.target.value) || 1)}
                className="h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="inventory">Current Inventory</Label>
              <Input
                id="inventory"
                type="number"
                min="0"
                step="0.1"
                value={currentInventory}
                onChange={(e) => setCurrentInventory(parseFloat(e.target.value) || 0)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventoryUnit">Unit</Label>
              <Select
                value={inventoryUnit}
                onValueChange={setInventoryUnit}
              >
                <SelectTrigger id="inventoryUnit" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servings">Servings</SelectItem>
                  <SelectItem value="bottles">Bottles</SelectItem>
                  <SelectItem value="oz">oz</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#4A3728]">Ingredients</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} added
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setQuickAddDialogOpen(true)}
              className="h-9"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Item
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAddIngredient}
              className="h-9 bg-[#4A7C59] hover:bg-[#3A6C49]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Ingredient
            </Button>
          </div>
        </div>

        {/* New Items Alert */}
        {newIngredientItems.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-green-800 mb-1">
                {newIngredientItems.length} new item{newIngredientItems.length !== 1 ? 's' : ''} will be created
              </p>
              <ul className="text-green-700 space-y-0.5">
                {newIngredientItems.map((item) => (
                  <li key={item.id}>
                    • {item.name} ({item.category})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Ingredients List */}
        {ingredients.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">No ingredients added yet</p>
            <p className="text-xs text-gray-400">
              Click "Add Ingredient" to start building your recipe
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 border-2 ${
                  ingredient.isNew || isItemNew(ingredient.itemId)
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Ingredient {index + 1}
                    </span>
                    {(ingredient.isNew || isItemNew(ingredient.itemId)) && (
                      <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full font-medium">
                        NEW
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveIngredient(index)}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Select
                    value={ingredient.itemId}
                    onValueChange={(value) => handleUpdateIngredient(index, 'itemId', value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select ingredient item..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allAvailableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id!}>
                          <div className="flex items-center gap-2">
                            {isItemNew(item.id!) && (
                              <span className="text-xs px-1.5 py-0.5 bg-green-600 text-white rounded font-medium">
                                NEW
                              </span>
                            )}
                            <span>
                              {item.name}
                            </span>
                            <span className="text-xs text-gray-500">({item.category})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.25"
                      placeholder="Quantity"
                      value={ingredient.quantity || ''}
                      onChange={(e) =>
                        handleUpdateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      className="h-10"
                    />
                    <Select
                      value={ingredient.unit}
                      onValueChange={(value) => handleUpdateIngredient(index, 'unit', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oz">oz</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="dashes">dashes</SelectItem>
                        <SelectItem value="drops">drops</SelectItem>
                        <SelectItem value="bottles">bottles</SelectItem>
                        <SelectItem value="each">each</SelectItem>
                        <SelectItem value="leaves">leaves</SelectItem>
                        <SelectItem value="slices">slices</SelectItem>
                        <SelectItem value="wedges">wedges</SelectItem>
                        <SelectItem value="sprigs">sprigs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-[#F5F1E8] py-4 -mx-4 px-4 border-t-2 border-gray-200">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveRecipe}
          className="flex-1 h-12 bg-[#4A7C59] hover:bg-[#3A6C49] text-white font-semibold"
          disabled={!recipeName.trim() || ingredients.length === 0}
        >
          {editingItem ? 'Update Recipe' : 'Create Recipe'}
        </Button>
      </div>

      {/* Quick Add Item Dialog */}
      <Dialog open={quickAddDialogOpen} onOpenChange={setQuickAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Add Ingredient Item</DialogTitle>
            <DialogDescription>
              Create a new ingredient item to use in this recipe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quickName">Item Name *</Label>
              <Input
                id="quickName"
                value={quickAddData.name}
                onChange={(e) => setQuickAddData({ ...quickAddData, name: e.target.value })}
                placeholder="e.g., Habanero Syrup"
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="quickCategory">Category *</Label>
                <Select
                  value={quickAddData.category}
                  onValueChange={(value) =>
                    setQuickAddData({ ...quickAddData, category: value as Item['category'] })
                  }
                >
                  <SelectTrigger id="quickCategory" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spirit">Spirit</SelectItem>
                    <SelectItem value="mixer">Mixer</SelectItem>
                    <SelectItem value="garnish">Garnish</SelectItem>
                    <SelectItem value="wine">Wine</SelectItem>
                    <SelectItem value="beer">Beer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quickUnit">Unit *</Label>
                <Select
                  value={quickAddData.inventoryUnit}
                  onValueChange={(value) =>
                    setQuickAddData({ ...quickAddData, inventoryUnit: value })
                  }
                >
                  <SelectTrigger id="quickUnit" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="each">Each</SelectItem>
                    <SelectItem value="bunches">Bunches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quickInventory">Initial Inventory (optional)</Label>
              <Input
                id="quickInventory"
                type="number"
                min="0"
                step="0.1"
                value={quickAddData.currentInventory}
                onChange={(e) =>
                  setQuickAddData({
                    ...quickAddData,
                    currentInventory: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="h-11"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setQuickAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleQuickAddItem}
              className="bg-[#4A7C59] hover:bg-[#3A6C49]"
              disabled={!quickAddData.name.trim()}
            >
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
