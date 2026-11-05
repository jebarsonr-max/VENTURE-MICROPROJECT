from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.models import Product, Category, Vendor, User
from app.schemas.schemas import ProductOut, ProductCreate, ProductUpdate, CategoryOut
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/products", tags=["Products & Catalog"])

@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("", response_model=List[ProductOut])
def get_products(
    category_id: Optional[int] = None,
    category_slug: Optional[str] = None,
    vendor_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_available == True)

    if category_id:
        query = query.filter(Product.category_id == category_id)
    if category_slug:
        cat = db.query(Category).filter(Category.slug == category_slug).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)
    if vendor_id:
        query = query.filter(Product.vendor_id == vendor_id)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%"))

    return query.all()

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductOut)
def create_product(
    prod_in: ProductCreate,
    current_user: User = Depends(require_role(["vendor", "admin"])),
    db: Session = Depends(get_db)
):
    vendor = current_user.vendor_profile
    if not vendor and current_user.role != "admin":
        raise HTTPException(status_code=400, detail="Vendor profile required to create products.")
    
    vendor_id = vendor.id if vendor else prod_in.vendor_id
    if not vendor_id:
        raise HTTPException(status_code=400, detail="Valid vendor ID required.")

    new_prod = Product(
        vendor_id=vendor_id,
        category_id=prod_in.category_id,
        name=prod_in.name,
        description=prod_in.description,
        price=prod_in.price,
        stock=prod_in.stock,
        image_url=prod_in.image_url,
        weight_kg=prod_in.weight_kg,
        is_available=prod_in.is_available
    )
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    return new_prod

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    prod_in: ProductUpdate,
    current_user: User = Depends(require_role(["vendor", "admin"])),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if current_user.role == "vendor" and product.vendor_id != current_user.vendor_profile.id:
        raise HTTPException(status_code=403, detail="You can only edit products from your own store.")

    update_data = prod_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(require_role(["vendor", "admin"])),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if current_user.role == "vendor" and product.vendor_id != current_user.vendor_profile.id:
        raise HTTPException(status_code=403, detail="You can only delete your own products.")

    db.delete(product)
    db.commit()
    return {"message": "Product removed successfully", "product_id": product_id}

