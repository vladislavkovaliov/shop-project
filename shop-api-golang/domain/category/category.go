package category

import "time"

type Category struct {
	id        int64
	title     string
	slug      string
	createdAt time.Time
}

func (c *Category) ID() int64 {
	return c.id
}

func (c *Category) Title() string {
	return c.title
}

func (c *Category) Slug() string {
	return c.slug
}

func (c *Category) CreatedAt() time.Time {
	return c.createdAt
}

func NewCategory(id int64, title string, slug string, createdAt time.Time) *Category {
	return &Category{id: id, title: title, slug: slug, createdAt: createdAt}
}
