package order

type OrderItem struct {
	productID int64
	title     string
	price     float64
	quantity  int
}

func (i *OrderItem) ProductID() int64 {
	return i.productID
}

func (i *OrderItem) Title() string {
	return i.title
}

func (i *OrderItem) Price() float64 {
	return i.price
}

func (i *OrderItem) Quantity() int {
	return i.quantity
}

func NewOrderItem(productID int64, title string, price float64, quantity int) *OrderItem {
	return &OrderItem{
		productID: productID,
		title:     title,
		price:     price,
		quantity:  quantity,
	}
}
