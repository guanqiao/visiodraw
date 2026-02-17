/**
 * 类图模板
 * 对标 Mermaid classDiagram
 */

import type { DiagramTemplate, TemplateGenerateOptions } from '../types/diagramTemplate'
import { createTemplateNode, createTemplateEdge } from '../utils/diagramTemplateBuilder'

/**
 * 简单类图模板
 */
export function createSimpleClassTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('animal', 'uml-class', 'Animal\n+name: string\n+age: int\n+makeSound()', 0, options),
    createTemplateNode('dog', 'uml-class', 'Dog\n+breed: string\n+bark()', 1, options),
    createTemplateNode('cat', 'uml-class', 'Cat\n+color: string\n+meow()', 2, options),
  ]

  const edges = [
    createTemplateEdge('animal', 'dog', '继承', 0),
    createTemplateEdge('animal', 'cat', '继承', 1),
  ]

  return {
    id: 'class-simple',
    name: '简单类图',
    description: '动物继承关系示例',
    type: 'class',
    nodes,
    edges,
    mermaidCode: `classDiagram
    class Animal {
        +name: string
        +age: int
        +makeSound()
    }
    class Dog {
        +breed: string
        +bark()
    }
    class Cat {
        +color: string
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
  }
}

/**
 * 接口实现模板
 */
export function createInterfaceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('shape', 'uml-interface', '«interface»\nShape\n+draw()\n+getArea()', 0, options),
    createTemplateNode('circle', 'uml-class', 'Circle\n-radius: double\n+draw()\n+getArea()', 1, options),
    createTemplateNode('rectangle', 'uml-class', 'Rectangle\n-width: double\n-height: double\n+draw()\n+getArea()', 2, options),
  ]

  const edges = [
    createTemplateEdge('shape', 'circle', '实现', 0),
    createTemplateEdge('shape', 'rectangle', '实现', 1),
  ]

  return {
    id: 'class-interface',
    name: '接口实现',
    description: 'Shape接口及其实现类',
    type: 'class',
    nodes,
    edges,
    mermaidCode: `classDiagram
    class Shape <<interface>>
    Shape : +draw()
    Shape : +getArea()
    
    class Circle {
        -radius: double
        +draw()
        +getArea()
    }
    
    class Rectangle {
        -width: double
        -height: double
        +draw()
        +getArea()
    }
    
    Shape <|.. Circle
    Shape <|.. Rectangle`,
  }
}

/**
 * 关联关系模板
 */
export function createAssociationTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('customer', 'uml-class', 'Customer\n-name: string\n-email: string', 0, options),
    createTemplateNode('order', 'uml-class', 'Order\n-orderId: string\n-date: Date', 1, options),
    createTemplateNode('product', 'uml-class', 'Product\n-name: string\n-price: double', 2, options),
  ]

  const edges = [
    createTemplateEdge('customer', 'order', '1..*', 0),
    createTemplateEdge('order', 'product', '1..*', 1),
  ]

  return {
    id: 'class-association',
    name: '关联关系',
    description: '客户-订单-商品关联',
    type: 'class',
    nodes,
    edges,
    mermaidCode: `classDiagram
    class Customer {
        -name: string
        -email: string
    }
    
    class Order {
        -orderId: string
        -date: Date
    }
    
    class Product {
        -name: string
        -price: double
    }
    
    Customer "1" --> "*" Order : 拥有
    Order "*" --> "*" Product : 包含`,
  }
}

/**
 * 组合聚合模板
 */
export function createCompositionTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('car', 'uml-class', 'Car\n-vin: string\n+start()', 0, options),
    createTemplateNode('engine', 'uml-class', 'Engine\n-horsepower: int\n+start()', 1, options),
    createTemplateNode('wheel', 'uml-class', 'Wheel\n-size: int', 2, options),
    createTemplateNode('department', 'uml-class', 'Department\n-name: string', 3, options),
    createTemplateNode('employee', 'uml-class', 'Employee\n-id: string\n-name: string', 4, options),
  ]

  const edges = [
    createTemplateEdge('car', 'engine', '组合', 0),
    createTemplateEdge('car', 'wheel', '组合', 1),
    createTemplateEdge('department', 'employee', '聚合', 2),
  ]

  return {
    id: 'class-composition',
    name: '组合与聚合',
    description: '组合和聚合关系示例',
    type: 'class',
    nodes,
    edges,
    mermaidCode: `classDiagram
    class Car {
        -vin: string
        +start()
    }
    
    class Engine {
        -horsepower: int
        +start()
    }
    
    class Wheel {
        -size: int
    }
    
    class Department {
        -name: string
    }
    
    class Employee {
        -id: string
        -name: string
    }
    
    Car *-- Engine : 组合
    Car *-- "4" Wheel : 组合
    Department o-- Employee : 聚合`,
  }
}

/**
 * 抽象类模板
 */
export function createAbstractClassTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('vehicle', 'uml-abstract-class', '«abstract»\nVehicle\n#speed: int\n+move()*', 0, options),
    createTemplateNode('car', 'uml-class', 'Car\n-engineType: string\n+move()', 1, options),
    createTemplateNode('bicycle', 'uml-class', 'Bicycle\n-gears: int\n+move()', 2, options),
  ]

  const edges = [
    createTemplateEdge('vehicle', 'car', '继承', 0),
    createTemplateEdge('vehicle', 'bicycle', '继承', 1),
  ]

  return {
    id: 'class-abstract',
    name: '抽象类',
    description: '抽象类及其子类',
    type: 'class',
    nodes,
    edges,
    mermaidCode: `classDiagram
    class Vehicle <<abstract>>
    Vehicle : #speed: int
    Vehicle : +move()*
    
    class Car {
        -engineType: string
        +move()
    }
    
    class Bicycle {
        -gears: int
        +move()
    }
    
    Vehicle <|-- Car
    Vehicle <|-- Bicycle`,
  }
}

/**
 * 获取所有类图模板
 */
export function getClassTemplates(options: TemplateGenerateOptions = {}): DiagramTemplate[] {
  return [
    createSimpleClassTemplate(options),
    createInterfaceTemplate(options),
    createAssociationTemplate(options),
    createCompositionTemplate(options),
    createAbstractClassTemplate(options),
  ]
}
