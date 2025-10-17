package helpers

import (
	"reflect"
	"testing"
)

type Item struct {
	Id    string
	Value int
}

func TestMapFunc(t *testing.T) {
	type NewItem struct {
		Value int
	}

	var array = []Item{
		{Id: "randomId", Value: 2},
		{Id: "moreeerandomId", Value: 5},
		{Id: "more moreeerandomId", Value: 2},
	}
	got := MapFunc(array, func(item Item, idx int) NewItem {
		if idx == len(array)-1 {
			return NewItem{
				Value: 9,
			}
		}
		return NewItem{
			Value: item.Value,
		}
	})

	want := []NewItem{
		{Value: 2},
		{Value: 5},
		{Value: 9},
	}

	if !reflect.DeepEqual(got, want) {
		t.Errorf("TestMapFunc: %+v does not equal %+v", got, want)
	}
}

func TestFilterFunc(t *testing.T) {
	var array = []Item{
		{Id: "12312", Value: 1000},
		{Id: "test", Value: 2000},
		{Id: "more test", Value: 5000},
		{Id: "more test 2", Value: 6000},
	}

	newArray := FilterFunc(array, func(item Item, idx int) bool {
		return item.Value >= 5000
	})

	want := []Item{
		{Id: "more test", Value: 5000},
		{Id: "more test 2", Value: 6000},
	}

	if !reflect.DeepEqual(newArray, want) {
		t.Errorf("TestFilterFunc: %+v does not equal %+v", newArray, want)
	}
}

func TestFindFunc(t *testing.T) {
	var array = []Item{
		{Id: "12312", Value: 1000},
		{Id: "test", Value: 2000},
		{Id: "more test", Value: 5000},
		{Id: "more test 2", Value: 6000},
	}

	want := Item{
		Id: "more test", Value: 5000,
	}

	found := FindFunc(array, func(item Item, _ int) bool {
		return item.Id == "more test"
	})

	if !reflect.DeepEqual(want, found) {
		t.Errorf("TestFindFunc: %+v does not equal %+v", found, want)
	}
}
