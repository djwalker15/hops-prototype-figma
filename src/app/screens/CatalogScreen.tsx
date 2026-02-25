import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { RecipeBuilder } from '../components/RecipeBuilder';
import { WasteReasonsManager } from '../components/WasteReasonsManager';
import { getCurrentUser } from '../data/storage';
import { type Item } from '../data/mockData';
import { useItems, useAddItem, useUpdateItem } from '../hooks/useItems';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  Wine,
  Beer,
  Grape,
  Beaker,
  MoreHorizontal,
  List,
  ChefHat,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';

export function CatalogScreen() {
  const navigate = useNavigate();
  const { data: items = [], isLoading: loading } = useItems();
  const addItemMutation = useAddItem();
  const updateItemMutation = useUpdateItem();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'recipe' | 'reasons'>('list');
  const [showRecipeBuilder, setShowRecipeBuilder] = useState(false);
  const [recipeBuilderEditItem, setRecipeBuilderEditItem] = useState<Item | null>(null);

  // Check auth on mount and route changes
  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate('/', { replace: true });
      return;
    }

    if (currentUser.role !== 'manager') {
      navigate('/home', { replace: true });
      return;
    }
  }, [navigate]);

  // Form state for new/edit item
  const [formData, setFormData] = useState({
    name: '',
    category: 'cocktail' as Item['category'],
    typicalServingSize: 1,
    currentInventory: 0,
    inventoryUnit: 'bottles',
    hasRecipe: false,
    recipeYield: 1,
    ingredients: [] as { itemId: string; quantity: number; unit: string }[],
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        typicalServingSize: item.typicalServingSize || 1,
        currentInventory: item.currentInventory || 0,
        inventoryUnit: item.inventoryUnit || 'bottles',
        hasRecipe: item.hasRecipe || false,
        recipeYield: item.recipeYield || 1,
        ingredients: item.ingredients || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'cocktail',
        typicalServingSize: 1,
        currentInventory: 0,
        inventoryUnit: 'bottles',
        hasRecipe: false,
        recipeYield: 1,
        ingredients: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingItem) {
        await updateItemMutation.mutateAsync({ id: editingItem.id, updates: formData });
      } else {
        const newItem: Item = {
          id: `r${Date.now()}`,
          ...formData,
          isActive: true,
        };
        await addItemMutation.mutateAsync(newItem);
      }
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save item. Please try again.');
    }
  };

  const handleToggleActive = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    try {
      await updateItemMutation.mutateAsync({ id: itemId, updates: { isActive: !item.isActive } });
    } catch (error) {
      console.error('Failed to toggle item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await updateItemMutation.mutateAsync({ id: itemId, updates: { isActive: false } });
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  // Recipe builder helpers
  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { itemId: '', quantity: 0, unit: 'oz' }],
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const handleUpdateIngredient = (
    index: number,
    field: 'itemId' | 'quantity' | 'unit',
    value: string | number
  ) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  // Get available items for ingredient selection (exclude current item being edited)
  const availableIngredientItems = items.filter(
    item => item.id !== editingItem?.id && item.isActive
  );

  const getCategoryIcon = (category: Item['category']) => {
    switch (category) {
      case 'cocktail':
        return <Wine className="h-4 w-4" />;
      case 'beer':
        return <Beer className="h-4 w-4" />;
      case 'wine':
        return <Grape className="h-4 w-4" />;
      case 'batch':
        return <Beaker className="h-4 w-4" />;
      default:
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: Item['category']) => {
    switch (category) {
      case 'cocktail':
        return 'bg-purple-100 text-purple-700';
      case 'beer':
        return 'bg-amber-100 text-amber-700';
      case 'wine':
        return 'bg-red-100 text-red-700';
      case 'batch':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Handle Recipe Builder save
  const handleRecipeBuilderSave = (recipeItem: Partial<Item>, newIngredientItems: Partial<Item>[]) => {
    // First, add all new ingredient items to the catalog
    const newItems = newIngredientItems.map(item => ({
      ...item,
      id: item.id || `i${Date.now()}-${Math.random()}`,
      isActive: true,
    } as Item));
    
    // Update the catalog with new ingredient items
    const updatedItems = [...items, ...newItems];

    // Then add or update the recipe item
    if (recipeBuilderEditItem) {
      // Update existing
      setItems(
        updatedItems.map(i =>
          i.id === recipeBuilderEditItem.id ? { ...i, ...recipeItem } as Item : i
        )
      );
    } else {
      // Add new recipe
      const finalRecipeItem: Item = {
        ...(recipeItem as Item),
        id: `r${Date.now()}`,
        isActive: true,
      };
      setItems([...updatedItems, finalRecipeItem]);
    }

    // Close the recipe builder
    setShowRecipeBuilder(false);
    setRecipeBuilderEditItem(null);
    setActiveTab('list');
  };

  const handleRecipeBuilderCancel = () => {
    setShowRecipeBuilder(false);
    setRecipeBuilderEditItem(null);
    setActiveTab('list');
  };

  const handleOpenRecipeBuilder = (item?: Item) => {
    setRecipeBuilderEditItem(item || null);
    setShowRecipeBuilder(true);
    setActiveTab('recipe');
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] pb-20">
      {/* Header */}
      <Header title="Inventory Catalog" subtitle="Manage inventory items and recipes" />

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setActiveTab('list');
                setShowRecipeBuilder(false);
              }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${ 
                activeTab === 'list' 
                  ? 'border-[#4A7C59] text-[#4A7C59] font-semibold' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
              <span>Item List</span>
            </button>
            <button
              onClick={() => handleOpenRecipeBuilder()}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${ 
                activeTab === 'recipe' 
                  ? 'border-[#4A7C59] text-[#4A7C59] font-semibold' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChefHat className="h-4 w-4" />
              <span>Recipe Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('reasons')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${ 
                activeTab === 'reasons' 
                  ? 'border-[#4A7C59] text-[#4A7C59] font-semibold' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              <span>Waste Reasons</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Based on Active Tab */}
      {activeTab === 'list' && !showRecipeBuilder && (
        <>
          {/* Search and Filter Bar */}
          <div className="bg-white border-b border-gray-200 p-4 sticky top-[53px] z-10 shadow-sm">
            <div className="max-w-2xl mx-auto space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              {/* Filter and Add Button Row */}
              <div className="flex gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-10 flex-1">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="cocktail">Cocktails</SelectItem>
                    <SelectItem value="wine">Wines</SelectItem>
                    <SelectItem value="beer">Beers</SelectItem>
                    <SelectItem value="spirit">Spirits</SelectItem>
                    <SelectItem value="mixer">Mixers</SelectItem>
                    <SelectItem value="garnish">Garnishes</SelectItem>
                    <SelectItem value="batch">Batch Items</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => handleOpenDialog()}
                      className="h-10 bg-[#4A7C59] hover:bg-[#3A6C49] text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? 'Edit Item' : 'Add New Item'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingItem 
                          ? 'Update the item details and recipe below.'
                          : 'Add a new item to the inventory catalog.'
                        }
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      {/* Basic Details */}
                      <div className="space-y-4 pb-4 border-b">
                        <h3 className="font-semibold text-sm text-[#4A3728]">Basic Details</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="name">Item Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Old Fashioned"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select 
                              value={formData.category} 
                              onValueChange={(value) => setFormData({ ...formData, category: value as Item['category'] })}
                            >
                              <SelectTrigger id="category">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cocktail">Cocktail</SelectItem>
                                <SelectItem value="wine">Wine</SelectItem>
                                <SelectItem value="beer">Beer</SelectItem>
                                <SelectItem value="spirit">Spirit</SelectItem>
                                <SelectItem value="mixer">Mixer</SelectItem>
                                <SelectItem value="garnish">Garnish</SelectItem>
                                <SelectItem value="batch">Batch</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="servingSize">Serving Size</Label>
                            <Input
                              id="servingSize"
                              type="number"
                              min="1"
                              value={formData.typicalServingSize}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                typicalServingSize: parseInt(e.target.value) || 1 
                              })}
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
                              value={formData.currentInventory}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                currentInventory: parseFloat(e.target.value) || 0 
                              })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="inventoryUnit">Unit</Label>
                            <Select 
                              value={formData.inventoryUnit} 
                              onValueChange={(value) => setFormData({ ...formData, inventoryUnit: value })}
                            >
                              <SelectTrigger id="inventoryUnit">
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
                      </div>

                      {/* Recipe Section */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="hasRecipe" 
                            checked={formData.hasRecipe}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, hasRecipe: !!checked })
                            }
                          />
                          <Label 
                            htmlFor="hasRecipe"
                            className="text-sm font-semibold text-[#4A3728] cursor-pointer"
                          >
                            This item has a recipe (made from other items)
                          </Label>
                        </div>

                        {formData.hasRecipe && (
                          <div className="space-y-4 pl-2 border-l-2 border-[#8B6F47]">
                            <div className="space-y-2">
                              <Label htmlFor="recipeYield">Recipe Yield (servings)</Label>
                              <Input
                                id="recipeYield"
                                type="number"
                                min="1"
                                value={formData.recipeYield}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  recipeYield: parseInt(e.target.value) || 1 
                                })}
                              />
                            </div>

                            {/* Ingredients List */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm">Ingredients</Label>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={handleAddIngredient}
                                  className="h-7 text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Ingredient
                                </Button>
                              </div>

                              {formData.ingredients.length === 0 ? (
                                <div className="bg-gray-50 rounded p-3 text-center text-sm text-gray-500">
                                  No ingredients added yet
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {formData.ingredients.map((ingredient, index) => (
                                    <div 
                                      key={index} 
                                      className="bg-gray-50 rounded p-3 space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-700">
                                          Ingredient {index + 1}
                                        </span>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleRemoveIngredient(index)}
                                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>

                                      <Select
                                        value={ingredient.itemId}
                                        onValueChange={(value) => 
                                          handleUpdateIngredient(index, 'itemId', value)
                                        }
                                      >
                                        <SelectTrigger className="h-9 text-sm">
                                          <SelectValue placeholder="Select item..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availableIngredientItems.map(item => (
                                            <SelectItem key={item.id} value={item.id}>
                                              {item.name} ({item.category})
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
                                            handleUpdateIngredient(
                                              index, 
                                              'quantity', 
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="h-9 text-sm"
                                        />
                                        <Select
                                          value={ingredient.unit}
                                          onValueChange={(value) => 
                                            handleUpdateIngredient(index, 'unit', value)
                                          }
                                        >
                                          <SelectTrigger className="h-9 text-sm">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="oz">oz</SelectItem>
                                            <SelectItem value="ml">ml</SelectItem>
                                            <SelectItem value="dashes">dashes</SelectItem>
                                            <SelectItem value="bottles">bottles</SelectItem>
                                            <SelectItem value="each">each</SelectItem>
                                            <SelectItem value="leaves">leaves</SelectItem>
                                            <SelectItem value="slices">slices</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveItem}
                        className="bg-[#4A7C59] hover:bg-[#3A6C49] text-white"
                        disabled={!formData.name.trim()}
                      >
                        {editingItem ? 'Update' : 'Add'} Item
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Item List */}
          <div className="max-w-2xl mx-auto p-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                <p className="text-2xl font-bold text-[#4A3728]">{items.length}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                <p className="text-2xl font-bold text-green-600">
                  {items.filter(i => i.isActive).length}
                </p>
                <p className="text-xs text-gray-600">Active</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                <p className="text-2xl font-bold text-gray-400">
                  {items.filter(i => !i.isActive).length}
                </p>
                <p className="text-xs text-gray-600">Inactive</p>
              </div>
            </div>

            {/* Item Cards */}
            <div className="space-y-2">
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p className="text-gray-500">No items found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchQuery ? 'Try a different search term' : 'Add your first item to get started'}
                  </p>
                </div>
              ) : (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg p-4 shadow-sm border-2 transition-all ${
                      item.isActive 
                        ? 'border-transparent' 
                        : 'border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-1.5 rounded ${getCategoryColor(item.category)}`}>
                            {getCategoryIcon(item.category)}
                          </div>
                          <h3 className="font-semibold text-[#4A3728] truncate">
                            {item.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="capitalize">{item.category}</span>
                          {item.currentInventory !== undefined && (
                            <>
                              <span>•</span>
                              <span>{item.currentInventory} {item.inventoryUnit}</span>
                            </>
                          )}
                          {item.hasRecipe && (
                            <>
                              <span>•</span>
                              <span className="text-purple-600">Has Recipe</span>
                            </>
                          )}
                          {!item.isActive && (
                            <>
                              <span>•</span>
                              <span className="text-red-600 font-medium">Inactive</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          {item.isActive ? (
                            <X className="h-4 w-4 text-gray-600" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Recipe Builder Tab */}
      {activeTab === 'recipe' && showRecipeBuilder && (
        <div className="max-w-2xl mx-auto p-4">
          <RecipeBuilder
            existingItems={items.filter(i => i.isActive)}
            onSave={handleRecipeBuilderSave}
            onCancel={handleRecipeBuilderCancel}
            editingItem={recipeBuilderEditItem}
          />
        </div>
      )}

      {/* Waste Reasons Tab */}
      {activeTab === 'reasons' && (
        <div className="max-w-2xl mx-auto p-4">
          <WasteReasonsManager />
        </div>
      )}

      <BottomNav />
    </div>
  );
}