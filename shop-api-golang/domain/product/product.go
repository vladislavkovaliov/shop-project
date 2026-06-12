package product

type Product struct {
	id       int64
	title    string
	price    float64
	category string
}

func (p *Product) ID() int64 {
	return p.id
}

func (p *Product) Title() string {
	return p.title
}

func (p *Product) Price() float64 {
	return p.price
}

func (p *Product) Category() string {
	return p.category
}

func NewProduct(id int64, title string, price float64, category string) *Product {
	return &Product{id: id, title: title, price: price, category: category}
}
